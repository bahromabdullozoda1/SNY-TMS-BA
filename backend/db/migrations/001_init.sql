CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'driver', 'accountant')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40),
  email VARCHAR(120),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'on_leave')),
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loads (
  id SERIAL PRIMARY KEY,
  load_number VARCHAR(80) UNIQUE NOT NULL,
  shipper VARCHAR(120),
  receiver VARCHAR(120),
  pickup_location VARCHAR(160) NOT NULL,
  delivery_location VARCHAR(160) NOT NULL,
  pickup_date DATE,
  delivery_date DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('new', 'in_progress', 'delivered', 'cancelled')),
  priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  driver_id INT REFERENCES drivers(id),
  rate NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS load_history (
  id SERIAL PRIMARY KEY,
  load_id INT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  action VARCHAR(80) NOT NULL,
  actor VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
