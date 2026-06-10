// netlify/functions/validate-reservation.js
// Fanette clique "Valider" dans l'admin → mail de confirmation au client

const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Sécurité : vérifier que c'est Fanette (token d'admin)
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { reservationId, adminToken } = JSON.parse(event.body);

    // Vérifier le token admin (à générer une seule fois)
    const validAdminToken = process.env.ADMIN_TOKEN;
    if (adminToken !== validAdminToken) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized' }) };
    }

    if (!reservationId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'reservationId manquant' }) };
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    // 1. Récupérer la réservation depuis Supabase
    const getRes = await fetch(
      `${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    );

    if (!getRes.ok) {
      throw new Error(`Failed to fetch reservation: ${await getRes.text()}`);
    }

    const reservations = await getRes.json();
    if (!reservations || reservations.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Réservation non trouvée' }) };
    }

    const reservation = reservations[0];

    // 2. Marquer la réservation comme validée
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/reservations?id=eq.${reservationId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'validated',
          validated_at: new Date().toISOString()
        })
      }
    );

    if (!updateRes.ok) {
      throw new Error(`Failed to update reservation: ${await updateRes.text()}`);
    }

    // 3. Envoyer mail de confirmation au CLIENT
    const sendgridKey = process.env.SENDGRID_API_KEY;

    if (sendgridKey) {
      const mailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: reservation.client_email }],
            subject: '✓ Votre réservation est confirmée — FANETTE.K NAILS'
          }],
          from: { email: 'noreply@fanettekhnails.fr' },
          reply_to: { email: 'fk.nails26@gmail.com' },
          content: [{
            type: 'text/html',
            value: `
              <!DOCTYPE html>
              <html lang="fr">
              <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
              <body style="font-family: 'Playfair Display', serif; background: #f5f1ea; padding: 2rem;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 2rem; border: 1px solid #b8a179;">
                  <h1 style="text-align: center; color: #000; font-size: 2rem; margin: 0 0 1rem 0;">
                    FANETTE<span style="color: #b8a179;">.</span>K
                  </h1>
                  <p style="text-align: center; color: #9a9a9a; font-size: 0.9rem; letter-spacing: 0.2em; margin: 0 0 2rem 0; text-transform: uppercase;">
                    Prothésiste Ongulaire — Crest
                  </p>
                  
                  <h2 style="color: #000; font-size: 1.5rem; margin: 2rem 0 1rem 0;">Votre réservation est confirmée ✦</h2>
                  
                  <div style="background: #f5f1ea; padding: 1.5rem; margin: 2rem 0; border-left: 3px solid #b8a179;">
                    <p style="margin: 0 0 0.5rem 0;"><strong>Service :</strong> ${reservation.service_name}</p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Date :</strong> ${new Date(reservation.reservation_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 0 0 0.5rem 0;"><strong>Heure :</strong> ${reservation.reservation_time}</p>
                    <p style="margin: 0;"><strong>Lieu :</strong> 32 rue Archinard, 26400 Crest</p>
                  </div>

                  <h3 style="color: #000; font-size: 1rem; margin: 2rem 0 1rem 0;">Informations importantes</h3>
                  <ul style="color: #333; line-height: 1.8;">
                    <li>Arrivez <strong>10 minutes avant</strong> votre créneau</li>
                    <li>Le paiement de l'acompte (20€) a déjà été effectué</li>
                    <li>Annulation gratuite jusqu'à <strong>48h avant</strong> — appelez le 07 43 59 56 35</li>
                    <li>En cas d'imprévu, merci de signaler au plus tôt</li>
                  </ul>

                  <p style="color: #666; font-size: 0.9rem; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e9e3d8;">
                    Des questions ? Contactez Fanette au <strong>07 43 59 56 35</strong> ou directement sur Instagram <strong>@fanetek.nails</strong>
                  </p>

                  <p style="text-align: center; color: #b8a179; font-size: 0.85rem; margin-top: 2rem;">
                    À bientôt ! 💅
                  </p>
                </div>
              </body>
              </html>
            `
          }]
        })
      });

      if (!mailRes.ok) {
        console.error('SendGrid error:', await mailRes.text());
      }
    }

    // 4. Envoyer AUSSI une confirmation à Fanette (pour sa trace)
    const fanetteMail = process.env.FANETTE_EMAIL;
    if (sendgridKey && fanetteMail) {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendgridKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: fanetteMail }],
            subject: `✓ Réservation validée — ${reservation.client_name}`
          }],
          from: { email: 'noreply@fanettekhnails.fr' },
          content: [{
            type: 'text/html',
            value: `<p>Réservation <strong>#${reservationId}</strong> validée et confirmée au client.</p><p><strong>${reservation.client_name}</strong> — ${reservation.service_name} — ${reservation.reservation_date} à ${reservation.reservation_time}</p>`
          }]
        })
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: `Réservation validée et mail envoyé à ${reservation.client_email}`,
        reservationId: reservationId
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
