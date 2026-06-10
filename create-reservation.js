// Netlify Function : créer réservation + envoyer mail à Fanette + rediriger vers Stripe

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { serviceId, date, time, name, phone, email, notes } = JSON.parse(event.body);

    // 1. Valider les données
    if (!serviceId || !date || !time || !name || !phone || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Données manquantes' }) };
    }

    // 2. Charger le contenu (prix, services)
    const contentPath = process.env.GITHUB_CONTENT_PATH || '_data/content.json';
    const service = require(`../${contentPath}`).services.find(s => s.id === serviceId);
    if (!service) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Service non trouvé' }) };
    }

    // 3. Créer la réservation dans Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    const resPayload = {
      service_id: serviceId,
      service_name: service.name,
      service_price: service.price,
      client_name: name,
      client_phone: phone,
      client_email: email,
      reservation_date: date,
      reservation_time: time,
      notes: notes || '',
      status: 'pending', // en attente de paiement
      created_at: new Date().toISOString()
    };

    const resResponse = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(resPayload)
    });

    if (!resResponse.ok) {
      throw new Error(`Supabase error: ${await resResponse.text()}`);
    }

    const reservation = await resResponse.json();
    const reservationId = reservation[0]?.id;

    // 4. Envoyer mail à Fanette (via SendGrid ou autre)
    const fanetteMail = process.env.FANETTE_EMAIL || 'fk.nails26@gmail.com';
    const sendgridKey = process.env.SENDGRID_API_KEY;

    if (sendgridKey) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: fanetteMail }],
            subject: `Nouvelle réservation : ${name} le ${date} à ${time}`
          }],
          from: { email: 'noreply@fanettekhnails.fr' },
          content: [{
            type: 'text/html',
            value: `
              <h2>Nouvelle réservation en attente de paiement</h2>
              <p><strong>Client :</strong> ${name}</p>
              <p><strong>Téléphone :</strong> ${phone}</p>
              <p><strong>Email :</strong> ${email}</p>
              <p><strong>Service :</strong> ${service.name} (${service.price}€)</p>
              <p><strong>Date :</strong> ${date}</p>
              <p><strong>Heure :</strong> ${time}</p>
              <p><strong>Notes :</strong> ${notes || 'Aucune'}</p>
              <p style="color:#B8A179;"><strong>Statut :</strong> En attente d'acompte (20€)</p>
            `
          }]
        })
      });
    }

    // 5. Créer session Stripe Checkout
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Acompte - ${service.name}`,
            description: `Réservation ${date} à ${time}`
          },
          unit_amount: 2000 // 20€ en centimes
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/reservation-confirmee?rid=${reservationId}`,
      cancel_url: `${process.env.SITE_URL}/#reservation`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
        reservationId: reservationId,
        clientSecret: session.client_secret
      })
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
