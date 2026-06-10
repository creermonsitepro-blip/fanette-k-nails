-- Supabase SQL : créer les tables pour réservations et clients

-- Table : réservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price DECIMAL(10, 2) NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL UNIQUE,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending', -- pending | confirmed | completed | cancelled
  payment_date TIMESTAMP,
  stripe_session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(reservation_date, reservation_time) -- un seul rdv par créneau
);

-- Index pour recherche rapide
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_email ON reservations(client_email);

-- Table : profils clients (liés à auth.users)
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT UNIQUE NOT NULL,
  preferences TEXT, -- JSON: allergies, couleurs préférées, notes, etc.
  total_bookings INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vue pour les réservations de l'utilisateur
CREATE VIEW user_reservations AS
SELECT 
  r.id,
  r.service_name,
  r.reservation_date,
  r.reservation_time,
  r.status,
  r.created_at
FROM reservations r
WHERE r.status IN ('confirmed', 'completed');

-- Trigger : mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reservations_timestamp
BEFORE UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_client_profiles_timestamp
BEFORE UPDATE ON client_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) : chacun ne voit que ses rdv
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Policy : utilisateurs ne voient que leurs réservations
CREATE POLICY "Users can view their own reservations"
  ON reservations
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IS NULL); -- NULL pour clients pas loggés

CREATE POLICY "Users can create reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (true);

-- Policy : profils clients
CREATE POLICY "Users can view their own profile"
  ON client_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON client_profiles
  FOR UPDATE
  USING (auth.uid() = id);
