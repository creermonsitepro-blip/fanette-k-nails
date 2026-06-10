# 🎯 FANETTE.K NAILS — Guide Complet (Tous les détails)

## 📦 Ce que tu reçois

Un projet **complet et prêt à déployer** qui inclut :

✅ **Site public** — réservations en temps réel, paiement Stripe
✅ **Admin Fanette** — édite prix, textes, photos, créneaux via Sveltia CMS
✅ **Base de données** — Supabase (réservations + comptes clients)
✅ **Mails auto** — confirmation client quand Fanette valide
✅ **Système de validation** — Fanette approuve chaque réservation avant email client
✅ **Mentions légales** — données micro-entreprise complètes

---

## 🚀 Installation en 10 étapes (30 min)

### Étape 1 : Créer comptes gratuits (5 min)

#### GitHub
1. Aller à https://github.com/signup
2. Créer compte (garder le username)
3. Créer un nouveau repo : **`fanette-k-nails`**
4. Ne pas initialiser avec README

#### Supabase
1. Aller à https://supabase.com
2. Sign up avec GitHub (facile)
3. Créer un projet (région: Europe)
4. Copier dans un notepad :
   - **Project URL** (ex: `https://abcdef.supabase.co`)
   - **Anon Key** (clé publique)
   - **Service Role Key** (clé admin, plus tard)

#### Stripe
1. Aller à https://stripe.com
2. Sign up
3. Activer le mode test (la switch en haut)
4. Copier :
   - **Publishable Key** (commence par `pk_test_...`)
   - **Secret Key** (commence par `sk_test_...`)

#### SendGrid (optionnel mais important pour les mails)
1. Aller à https://sendgrid.com
2. Sign up
3. Créer une API Key
4. Ajouter une adresse d'envoi (ex: `noreply@fanettekhnails.fr`)
5. Copier la clé

#### DecapBridge
1. Aller à https://decapbridge.web.app
2. Sign in with GitHub
3. Ajouter le repo `fanette-k-nails`
4. **Copier l'URL fournie** (ressemble à `https://decapbridge.web.app/auth/...`)

#### Netlify
1. Aller à https://netlify.com
2. Sign up with GitHub
3. (On fait le déploiement à l'étape 5)

---

### Étape 2 : Cloner le repo et ajouter les fichiers

```bash
# Sur ton ordinateur
git clone https://github.com/TON_USERNAME/fanette-k-nails.git
cd fanette-k-nails

# Copier tous les fichiers du projet qu'on t'a donné
# (les fichiers du dossier fanette-project/)
cp -r ~/fanette-project/* .

# Vérifier la structure
ls -la
# Doit montrer: admin/, netlify/, _data/, public/, SETUP.md, netlify.toml, etc.

# Ajouter à Git
git add .
git commit -m "Initial commit - FANETTE.K NAILS project"
git push origin main
```

---

### Étape 3 : Configurer Supabase (5 min)

1. Aller dans Supabase Dashboard
2. Ouvrir **SQL Editor**
3. Créer une nouvelle query
4. **Copier TOUT le contenu de `_data/supabase-init.sql`**
5. Coller dans l'éditeur
6. Cliquer **RUN**

✅ Les tables `reservations` et `client_profiles` sont créées.

---

### Étape 4 : Configurer Netlify (10 min)

1. Aller à https://netlify.com/team
2. Cliquer **Add new site**
3. Choisir **Import an existing project**
4. Autoriser Netlify à accéder à GitHub
5. Choisir le repo `fanette-k-nails`
6. Configuration par défaut (elle la détecte du `netlify.toml`)
7. **Deploy site**

Attendre 2-3 min... Netlify t'affiche une URL (ex: `https://fanette-k-nails.netlify.app`)

---

### Étape 5 : Ajouter variables d'environnement (5 min)

Dans Netlify, aller à **Site settings** → **Build & deploy** → **Environment**

Ajouter ces variables (tes clés des comptes créés plus tôt) :

```
SUPABASE_URL=https://abcdef.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

FANETTE_EMAIL=fanette.k.nails@gmail.com
SITE_URL=https://fanette-k-nails.netlify.app

ADMIN_TOKEN=generate-a-random-string-here-min-32-chars

DECAPBRIDGE_URL=https://decapbridge.web.app
DECAPBRIDGE_REPO=TON_USERNAME/fanette-k-nails
```

**Comment générer `ADMIN_TOKEN`** :
- Ouvrir un terminal
- `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Copier le résultat

---

### Étape 6 : Redéployer (1 min)

1. Dans Netlify, aller à **Deployments**
2. Clique **Trigger deploy** → **Deploy site**
3. Attendre la fin (vert)

---

### Étape 7 : Configurer Sveltia CMS (2 min)

1. Ouvrir `admin/config.yml`
2. Chercher `TON_USER_GITHUB` et remplacer par ton username GitHub
3. Chercher `https://decapbridge-auth.example.com` et remplacer par l'URL de DecapBridge de l'étape 1
4. Sauver et push :

```bash
git add admin/config.yml
git commit -m "Update DecapBridge config"
git push origin main
```

Netlify redéploie auto.

---

### Étape 8 : Configurer content.json (2 min)

1. Ouvrir `_data/content.json`
2. Compléter les infos (c'est bon, c'est déjà rempli pour Fanette) :
   - `stripe.publicKey` → ta clé publique Stripe
   - `supabase.url` et `supabase.anonKey` → de Supabase
3. Sauver et push

---

### Étape 9 : Inviter Fanette (2 min)

1. Aller à https://decapbridge.web.app
2. Dans **Users**, ajouter l'email de Fanette
3. Elle reçoit un email
4. Elle clique, crée son compte DecapBridge
5. Elle peut accéder à `https://fanette-k-nails.netlify.app/admin`

---

### Étape 10 : Tester (5 min)

#### Test 1 : Site public
- Aller à `https://fanette-k-nails.netlify.app`
- Voir si tout s'affiche (logo, prestations, formulaire réservation)
- Remplir un formulaire (test données)

#### Test 2 : Admin Fanette
- Aller à `/admin`
- Se connecter avec son compte DecapBridge
- Éditer un prix (ex: Semi-permanent → 25€)
- Sauver
- Aller au site public → voir le prix changé

#### Test 3 : Paiement Stripe
- Remplir une réservation complète
- Arriver à la page de paiement Stripe (mode test)
- Utiliser carte test : `4242 4242 4242 4242` + date future + CVC `123`
- Cliquer **Payer**

#### Après paiement :
- Fanette reçoit un **email de notification** (paiement reçu)
- Page affiche "Réservation en attente de validation"

#### Fanette valide (étape cruciale) :
- Fanette va dans le **Dashboard** (lien dans son admin, ou lien direct que tu lui donnes)
- Elle voit la réservation en attente
- Elle clique **VALIDER**
- Le client reçoit **son email de confirmation** automatiquement
- Fanette reçoit une notification (trace pour elle)

---

## 📧 Flux email (très important)

### Mail 1 : Après réservation + paiement
**À :** Fanette (fanette.k.nails@gmail.com)
**Sujet :** "Nouvelle réservation : [nom client] le [date] à [heure]"
**Contenu :** Détails complets de la réservation (service, prix, coordonnées client)
**Déclencheur :** Fonction `create-reservation` (auto après Stripe)

### Mail 2 : Client reçoit confirmation (SEULEMENT si Fanette valide)
**À :** Client (son email)
**Sujet :** "✓ Votre réservation est confirmée — FANETTE.K NAILS"
**Contenu :** Beaumo HTML avec horaires, conseils avant rdv, numéro Fanette
**Déclencheur :** Fanette clique **VALIDER** dans son admin
**Fonction :** `validate-reservation.js`

### Mail 3 : Fanette reçoit notification de validation (trace)
**À :** Fanette
**Sujet :** "✓ Réservation validée — [nom client]"
**Contenu :** Résumé court
**Déclencheur :** Même que Mail 2

---

## 🎨 Pour Fanette : Comment éditer le site

### Accès
- URL : `https://fanette-k-nails.netlify.app/admin`
- Login : son compte DecapBridge

### Modifier les prix
1. **Contenu Principal** → **Prestations**
2. Cliquer sur une prestation (ex: "Semi-permanent")
3. Changer le prix (ex: 20€ → 25€)
4. **Sauver**
5. Le site se met à jour en direct

### Ajouter une photo à la galerie
1. **Galerie** → **Créer**
2. Télécharger photo
3. Choisir catégorie (Gainage / Rallongement / Semi-permanent)
4. Remplir la description
5. **Sauver**
6. Photo apparaît sur le site

### Changer les horaires
1. **Contenu Principal** → **Horaires**
2. Modifier Mardi, Mercredi, etc. (heure ouverture / fermeture)
3. **Sauver**

### Valider une réservation
1. (Pas encore dans l'admin Sveltia — pour maintenant, on le fait en attendant)
2. Fanette va à un **Dashboard** qu'on crée (lien privé)
3. Voir les réservations en attente
4. Cliquer **VALIDER**
5. Client reçoit mail auto

---

## 🔐 Sécurité

- **Fanette** : protégée par DecapBridge (pas de GitHub account nécessaire)
- **Clients** : créent un compte Supabase Auth automatiquement après paiement
- **API** : toutes les fonctions Netlify vérifient tokens/authentification
- **Données** : Row Level Security activé dans Supabase (chacun ne voit que ses données)

---

## 💡 À savoir

**Mode test vs Production**
- Actuellement en **mode test Stripe** (clés `pk_test_`, `sk_test_`)
- Les paiements ne sont pas vrais (utiliser carte test `4242...`)
- Quand c'est prêt : passer en **mode production** (clés `pk_live_`, `sk_live_`)

**Créneaux disponibles**
- Pour maintenant : tous les créneaux de chaque jour sont libres
- À l'avenir : créer un système de "slots" Fanette peut définir
- (Pas implémenté v1, mais facile à ajouter)

**Pas de mail = quoi faire**
1. Vérifier SendGrid API Key dans Netlify variables
2. Vérifier que l'adresse d'envoi est confirmée dans SendGrid
3. Checker les logs Netlify (la fonction affiche les erreurs)
4. SendGrid gratuit : max 100 emails/jour (suffisant)

---

## 📞 Support rapide

**Stripe redirige pas vers paiement :**
→ Vérifier `STRIPE_SECRET_KEY` dans Netlify

**Admin Sveltia ne charge pas :**
→ Vérifier `admin/config.yml` et URL DecapBridge

**Mail ne part pas :**
→ Vérifier `SENDGRID_API_KEY` et adresse d'envoi confirmée dans SendGrid

**Supabase erreur "Access denied" :**
→ Vérifier que la clé est `SUPABASE_KEY` (anon), pas la service key
→ Vérifier que les RLS policies sont créées (elles l'sont si tu as runné le SQL)

---

## 🎯 Prochaines étapes

1. **Maintenance régulière** : Fanette édite prix/photos via admin
2. **Validation réservations** : Fanette valide chaque réservation → mail client auto
3. **Monétisation** : Passer en mode production Stripe quand t'es sûr
4. **Évolutions** :
   - Page client pour voir historique réservations
   - Créneaux personnalisés par Fanette
   - Notes internes Fanette sur chaque client
   - Intégration SMS (Twilio) pour rappel avant rdv

---

**Besoin d'aide ? Relire ce guide ou appeler support Netlify/Supabase.**

Bon courage ! 🎉
