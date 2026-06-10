# 🚀 FANETTE.K NAILS — Guide d'Installation Complet

## Vue d'ensemble

Ce projet inclut :
- **Site public** (`index.html`) — réservation clients, galerie, infos
- **Admin** (`/admin`) — Sveltia CMS où Fanette édite prix, textes, photos, créneaux
- **Base de données** (Supabase) — réservations, comptes clients
- **Paiement** (Stripe) — acompte 20€
- **Déploiement** (Netlify) — site en ligne gratuit

---

## 📋 Étape 0 : Créer les comptes (5 min)

### 1. GitHub
- Créer compte : https://github.com/signup
- Une fois loggé, créer un nouveau repo : `fanette-k-nails`
- Clone le repo en local : `git clone https://github.com/TON_USER/fanette-k-nails.git`

### 2. Supabase
- Créer compte : https://supabase.com
- Créer un nouveau projet (région: Europe, gratuit)
- Copier : **URL du projet** et **Clé anon (public)**
- Dans **SQL Editor**, copier le contenu de `_data/supabase-init.sql` et exécuter

### 3. Stripe
- Créer compte : https://stripe.com
- Aller dans **Products** → créer un produit "Acompte FANETTE"
- Créer un **Payment Link** pour 20€ (une fois)
- Copier le lien → ça servira pour les redirections Stripe

### 4. DecapBridge
- Aller sur : https://decapbridge.web.app
- Se connecter avec GitHub
- Ajouter ton repo `fanette-k-nails`
- Copier l'URL d'authentification fournie

### 5. SendGrid (optionnel, pour mails)
- Créer compte : https://sendgrid.com
- Créer une clé API
- Ajouter l'adresse de départ (ex: `noreply@fanettekhnails.fr`)

---

## 🔧 Étape 1 : Configurer les variables Netlify

### Sur Netlify
1. Créer compte : https://netlify.com
2. Connecter GitHub
3. Déployer le repo `fanette-k-nails`
4. Aller dans **Site settings** → **Build & deploy** → **Environment**
5. Ajouter ces variables :

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx

SENDGRID_API_KEY=SG.xxxxx

FANETTE_EMAIL=fanette.k.nails@gmail.com
SITE_URL=https://fanette-k-nails.netlify.app

DECAPBRIDGE_URL=https://decapbridge.web.app
DECAPBRIDGE_REPO=TON_USER/fanette-k-nails
```

---

## 📝 Étape 2 : Configurer Sveltia CMS

### Dans le repo
1. Mettre à jour `admin/config.yml` :
   - Remplacer `TON_USER_GITHUB` par ton GitHub username
   - Remplacer `DECAPBRIDGE_URL` par l'URL copiée

2. Mettre à jour `_data/content.json` :
   - Ajouter les vrais liens Stripe
   - Ajouter les clés Supabase

### Sur le site
- Aller à : `https://fanette-k-nails.netlify.app/admin`
- Se connecter via DecapBridge (elle reçoit un e-mail d'invitation)
- Elle peut éditer :
  - Entreprise (téléphone, adresse, réseaux)
  - Prestations (prix, durées, descriptions)
  - Horaires (heures d'ouverture par jour)
  - Galerie (photos, catégories)
  - Créneaux dispo (dates, heures libres)

---

## 💳 Étape 3 : Configurer Stripe

### Pour les réservations
1. Dans `netlify/functions/create-reservation.js`, la ligne 70 crée une session Stripe Checkout
2. Le lien dans `content.json` → `stripe.depositLink` n'est plus utilisé
3. Chaque réservation crée son propre lien de paiement

### Test
1. Aller sur le site public
2. Faire une réservation (formulaire)
3. Être redirigé automatiquement vers Stripe
4. Payer 20€ (mode test : utiliser `4242 4242 4242 4242`)
5. Après paiement réussi → compte client créé auto + mail à Fanette

---

## 🗄️ Étape 4 : Configurer Supabase Auth pour les clients

### Auto-création de compte
Quand le client paie, la fonction `confirm-payment.js` :
1. Crée un compte Supabase Auth (email + password auto-générée)
2. Envoie un e-mail avec ses identifiants
3. Marque la réservation comme confirmée

### Espace client (optionnel futur)
Tu peux ajouter une page `/account` où les clients se connectent et voient :
- Leurs réservations passées et futures
- Historique des paiements
- Modifier leur profil

---

## 📧 Mentions légales (COMPLÉTÉES)

Tes infos réelles sont déjà dans `content.json` → `business` :
- **Nom** : Kuczma Fanette
- **SIREN** : 992 242 156
- **Adresse** : 32 rue Archinard, 26400 Crest
- **Activité** : Pose de prothèse ongulaire en salon
- **Statut** : Entrepreneur individuel (micro-entreprise)

La page `/mentions-legales` affiche tout ça automatiquement depuis `content.json`.

---

## 🎯 Étape 5 : Inviter Fanette

1. Ajouter son e-mail dans DecapBridge
2. Elle reçoit un e-mail
3. Elle clique le lien
4. Elle crée son compte DecapBridge
5. Elle accède à `/admin` et peut éditer le site

---

## 🧪 Checklist de test

- [ ] Le site s'affiche sans erreur
- [ ] Fanette peut se connecter à `/admin`
- [ ] Elle peut éditer les prix (ex: passer Semi-permanent de 20€ à 25€)
- [ ] Elle peut télécharger une photo dans la galerie
- [ ] La réservation fonctionne (formulaire → Stripe → confirmation)
- [ ] Elle reçoit un mail à chaque réservation
- [ ] Le client reçoit ses identifiants après paiement

---

## 🆘 Support rapide

**Stripe ne redirige pas vers ma page :**
- Vérifier `STRIPE_SECRET_KEY` dans Netlify
- Vérifier que le produit Stripe existe

**Supabase "Access denied":**
- Vérifier `SUPABASE_KEY` (clé anon, pas service key)
- Vérifier les RLS policies dans Supabase SQL

**Admin ne se charge pas :**
- Vérifier que `/admin/config.yml` existe
- Vérifier DecapBridge connection

**Mails ne partent pas :**
- Vérifier `SENDGRID_API_KEY`
- Vérifier l'adresse d'envoi dans SendGrid

---

## 📂 Structure finale

```
fanette-k-nails/
├── index.html                          # Site public
├── reservation-confirmee.html          # Page après paiement
├── mentions-legales.html               # Infos légales auto
├── admin/
│   ├── index.html                      # Interface Sveltia CMS
│   └── config.yml                      # Config édition Fanette
├── netlify/
│   └── functions/
│       ├── create-reservation.js       # Créer réservation + Stripe
│       └── confirm-payment.js          # Confirmer paiement + compte
├── _data/
│   ├── content.json                    # Données éditable (prix, textes, horaires)
│   └── supabase-init.sql               # Script création tables
├── public/
│   └── images/                         # Photos (upload via admin)
├── netlify.toml                        # Config déploiement
├── .gitignore                          # Fichiers à ignorer
└── README.md                           # Documentation
```

---

## 💪 Ça y est, tu es prêt !

Une fois tout ça en place :
- Fanette gère le site elle-même (`/admin`)
- Les clients réservent et paient (`/`)
- Tu reçois les confirmations par mail
- Tout est gratuit (Netlify, Supabase, SendGrid jusqu'à 100 mails/jour)

Des questions ?
