// netlify/functions/confirm-payment.js
// Appelée après paiement Stripe réussi — crée le compte client + marque la réservation confirmée

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { sessionId, reservationId, email, password } = JSON.parse(event.body);

    // 1. Vérifier le paiement Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return { statusCode: 400, body: JSON.stringify({ error: 'Paiement non confirmé' }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // clé admin

    // 2. Créer le compte client via Supabase Auth
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true // auto-confirmer l'email
      })
    });

    let userId;
    if (authResponse.ok) {
      const authData = await authResponse.json();
      userId = authData.user.id;
    } else {
      // L'utilisateur existe peut-être déjà
      console.log('Auth signup error:', await authResponse.text());
      // On peut accepter s'il existe
      userId = 'unknown';
    }

    // 3. Marquer la réservation comme confirmée dans Supabase
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'confirmed',
        user_id: userId,
        payment_date: new Date().toISOString(),
        stripe_session_id: sessionId
      })
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update reservation: ${await updateRes.text()}`);
    }

    // 4. (Optionnel) Envoyer une notification à Fanette que le paiement est reçu
    const fanetteMail = process.env.FANETTE_EMAIL;
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
            subject: `✓ Réservation confirmée — Acompte reçu`
          }],
          from: { email: 'noreply@fanettekhnails.fr' },
          content: [{
            type: 'text/html',
            value: `<p>Réservation #${reservationId} — Acompte de 20€ reçu. Client confirmé.</p>`
          }]
        })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        userId: userId,
        reservationId: reservationId,
        message: 'Compte créé et réservation confirmée'
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
