-- ============================================================
-- GlobeTrotter – PostgreSQL Schema + Seed Data
-- Run: psql -d globetrotter -f schema.sql
-- ============================================================

-- Drop in reverse dependency order
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS stop_activities CASCADE;
DROP TABLE IF EXISTS trip_destinations CASCADE;
DROP TABLE IF EXISTS stops CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone         VARCHAR(30),
  city          VARCHAR(100),
  country       VARCHAR(100),
  bio           TEXT,
  avatar_url    TEXT,
  is_admin      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DESTINATIONS
-- ─────────────────────────────────────────
CREATE TABLE destinations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  country     VARCHAR(100) NOT NULL,
  emoji       VARCHAR(10),
  cost_index  VARCHAR(20) CHECK (cost_index IN ('Low','Medium','High')),
  popularity  INTEGER DEFAULT 0,
  category    VARCHAR(50),
  description TEXT
);

-- ─────────────────────────────────────────
-- ACTIVITIES
-- ─────────────────────────────────────────
CREATE TABLE activities (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  city        VARCHAR(100),
  category    VARCHAR(50),
  cost        NUMERIC(10,2) DEFAULT 0,
  duration    VARCHAR(50),
  emoji       VARCHAR(10),
  description TEXT,
  rating      NUMERIC(2,1) DEFAULT 0
);

-- ─────────────────────────────────────────
-- TRIPS
-- ─────────────────────────────────────────
CREATE TABLE trips (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  start_date  DATE,
  end_date    DATE,
  status      VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming','ongoing','completed')),
  emoji       VARCHAR(10) DEFAULT '✈️',
  gradient    TEXT DEFAULT 'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
  budget      NUMERIC(12,2) DEFAULT 0,
  spent       NUMERIC(12,2) DEFAULT 0,
  is_public   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TRIP ↔ DESTINATIONS (many-to-many)
-- ─────────────────────────────────────────
CREATE TABLE trip_destinations (
  trip_id        INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  destination_id INTEGER REFERENCES destinations(id) ON DELETE CASCADE,
  PRIMARY KEY (trip_id, destination_id)
);

-- ─────────────────────────────────────────
-- STOPS (cities within a trip)
-- ─────────────────────────────────────────
CREATE TABLE stops (
  id          SERIAL PRIMARY KEY,
  trip_id     INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city        VARCHAR(100) NOT NULL,
  description TEXT,
  start_date  DATE,
  end_date    DATE,
  budget      NUMERIC(12,2) DEFAULT 0,
  order_index INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────
-- STOP ↔ ACTIVITIES (many-to-many)
-- ─────────────────────────────────────────
CREATE TABLE stop_activities (
  id             SERIAL PRIMARY KEY,
  stop_id        INTEGER NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
  activity_id    INTEGER REFERENCES activities(id) ON DELETE SET NULL,
  custom_name    VARCHAR(200),
  scheduled_time VARCHAR(10),
  day_number     INTEGER DEFAULT 1,
  cost_override  NUMERIC(10,2),
  notes          TEXT
);

-- ─────────────────────────────────────────
-- COMMUNITY POSTS
-- ─────────────────────────────────────────
CREATE TABLE community_posts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id    INTEGER REFERENCES trips(id) ON DELETE SET NULL,
  trip_name  VARCHAR(200),
  content    TEXT NOT NULL,
  likes      INTEGER DEFAULT 0,
  is_public  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_tags (
  post_id INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  tag     VARCHAR(50),
  PRIMARY KEY (post_id, tag)
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX idx_trips_user_id    ON trips(user_id);
CREATE INDEX idx_stops_trip_id    ON stops(trip_id);
CREATE INDEX idx_stop_act_stop_id ON stop_activities(stop_id);
CREATE INDEX idx_posts_user_id    ON community_posts(user_id);
CREATE INDEX idx_dest_name        ON destinations(name);
CREATE INDEX idx_act_city         ON activities(city);

-- ═══════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════

-- Demo user (password: "password123")
INSERT INTO users (first_name, last_name, email, password_hash, phone, city, country, bio, is_admin)
VALUES
  ('Alex', 'Wanderer', 'alex@globetrotter.app',
   '$2a$10$rqOf2OQnASW1QfUF8XTeRO6rvOtnYzo65FdU8vr1e/dpw/NEny1p6',
   '+1 (555) 234-5678', 'New York', 'USA',
   'Passionate explorer of hidden gems around the world 🌍', TRUE),
  ('Sarah', 'Chen', 'sarah@email.com',
   '$2a$10$rqOf2OQnASW1QfUF8XTeRO6rvOtnYzo65FdU8vr1e/dpw/NEny1p6',
   '+1 (555) 345-6789', 'San Francisco', 'USA',
   'Solo traveler & food enthusiast', FALSE),
  ('Marco', 'Rivera', 'marco@email.com',
   '$2a$10$rqOf2OQnASW1QfUF8XTeRO6rvOtnYzo65FdU8vr1e/dpw/NEny1p6',
   '+34 612 345 678', 'Madrid', 'Spain',
   'Architecture lover & coffee connoisseur', FALSE);

-- Destinations
INSERT INTO destinations (name, country, emoji, cost_index, popularity, category, description) VALUES
  ('Tokyo',      'Japan',       '🗼', 'Medium', 98, 'Asia',        'Neon-lit metropolis blending ancient tradition with futuristic innovation.'),
  ('Paris',      'France',      '🗺️', 'High',   97, 'Europe',      'The city of light, romance, art, and world-class cuisine.'),
  ('Bali',       'Indonesia',   '🌴', 'Low',    94, 'Asia',        'Tropical paradise with ancient temples and terraced rice fields.'),
  ('New York',   'USA',         '🗽', 'High',   96, 'America',     'The city that never sleeps — iconic skyline, culture, and energy.'),
  ('Dubai',      'UAE',         '🏙️', 'High',   91, 'Middle East', 'Futuristic desert city with record-breaking architecture and luxury.'),
  ('Santorini',  'Greece',      '🏛️', 'High',   93, 'Europe',      'Iconic white-washed buildings perched above the caldera.'),
  ('Kyoto',      'Japan',       '⛩️', 'Medium', 89, 'Asia',        'Japan''s cultural heart with over 1,600 Buddhist temples.'),
  ('Barcelona',  'Spain',       '🎨', 'Medium', 92, 'Europe',      'Gaudí architecture, vibrant nightlife, and world-famous food.'),
  ('Marrakech',  'Morocco',     '🕌', 'Low',    86, 'Africa',      'Labyrinthine medina, vibrant souks, and Saharan culture.'),
  ('Sydney',     'Australia',   '🦘', 'High',   88, 'Oceania',     'Harbour city with iconic landmarks and surf beaches.'),
  ('Rome',       'Italy',       '🏟️', 'Medium', 95, 'Europe',      'Eternal city with 2,000+ years of history and incredible food.'),
  ('Bangkok',    'Thailand',    '🛺', 'Low',    90, 'Asia',        'Bustling metropolis of ornate shrines and vibrant nightlife.');

-- Activities
INSERT INTO activities (name, city, category, cost, duration, emoji, description, rating) VALUES
  ('Eiffel Tower Visit',         'Paris',    'Sightseeing',   45,  '3h',       '🗼', 'Skip-the-line access to the iconic Eiffel Tower.',         4.8),
  ('Louvre Museum Tour',         'Paris',    'Culture',       55,  '4h',       '🖼️', 'Guided tour through the world''s largest art museum.',      4.9),
  ('Seine River Cruise',         'Paris',    'Leisure',       30,  '1.5h',     '🚢', 'Romantic evening cruise along the Seine.',                 4.7),
  ('Mt. Fuji Day Trip',          'Tokyo',    'Nature',        80,  'Full day', '🗻', 'Guided day excursion from Tokyo to iconic Mt. Fuji.',      4.9),
  ('Shibuya Crossing',           'Tokyo',    'Sightseeing',    0,  '3h',       '🚶', 'Walk the world''s busiest crossing and explore Harajuku.', 4.8),
  ('Tsukiji Food Tour',          'Tokyo',    'Food',          65,  '2h',       '🍣', 'Expert-guided tasting tour through Tokyo''s fish market.', 4.9),
  ('Central Park Bike Tour',     'New York', 'Adventure',     35,  '2h',       '🚴', 'Guided cycling tour through all major Central Park spots.',4.7),
  ('Brooklyn Bridge Walk',       'New York', 'Sightseeing',    0,  '1.5h',     '🌉', 'Self-guided walk across the iconic Brooklyn Bridge.',      4.8),
  ('Broadway Show',              'New York', 'Entertainment', 120, '2.5h',     '🎭', 'Premium seats at a top Broadway production.',              4.9),
  ('Burj Khalifa At.the.Top',   'Dubai',    'Sightseeing',    75, '2h',       '🏙️', 'Observation deck at the world''s tallest building.',       4.8),
  ('Desert Safari',              'Dubai',    'Adventure',      95, 'Half day', '🐫', 'Dune bashing + traditional Bedouin camp dinner.',         4.9),
  ('Sagrada Familia Tour',       'Barcelona','Culture',        40, '2h',       '⛪', 'Skip-the-line guided tour of Gaudí''s basilica.',          4.9),
  ('Paragliding over Bali',      'Bali',     'Adventure',     110, '30 min',  '🪂', 'Tandem paragliding with panoramic rice terrace views.',    4.8),
  ('Ubud Monkey Forest',         'Bali',     'Nature',         15, '2h',       '🐒', 'Sacred monkey sanctuary amid ancient temple ruins.',       4.6),
  ('Jemaa el-Fna Night Market',  'Marrakech','Food',           20, '3h',       '🥘', 'Vibrant street food stalls, storytellers, and musicians.', 4.7);

-- Trips for demo user (id=1)
INSERT INTO trips (user_id, name, description, start_date, end_date, status, emoji, gradient, budget, spent, is_public) VALUES
  (1, 'Paris Getaway',      'A romantic escape through the city of light.',
   '2024-01-09', '2024-01-16', 'completed', '🗼',
   'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 3200, 2980, TRUE),
  (1, 'Japan Adventure',    'Cherry blossoms, temples, and futuristic cities.',
   '2024-01-16', '2024-01-29', 'ongoing',   '⛩️',
   'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 5500, 2200, TRUE),
  (1, 'NYC Getaway',        'The Big Apple — food, art, and electric atmosphere.',
   '2024-01-15', '2024-01-22', 'upcoming',  '🗽',
   'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 4200, 0,    FALSE),
  (1, 'Bali Serenity',      'Find balance and beauty in the Island of Gods.',
   '2024-03-10', '2024-03-20', 'upcoming',  '🌴',
   'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 2800, 0,    FALSE),
  (1, 'Barcelona Architecture','Immerse yourself in Gaudí''s genius.',
   '2023-08-05', '2023-08-12', 'completed', '🎨',
   'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 3500, 3150, TRUE);

-- Stops for Paris Getaway (trip 1)
INSERT INTO stops (trip_id, city, description, start_date, end_date, budget, order_index) VALUES
  (1, 'Paris', 'Main stay — city exploration', '2024-01-09', '2024-01-16', 3200, 1);

-- Stops for Japan Adventure (trip 2)
INSERT INTO stops (trip_id, city, description, start_date, end_date, budget, order_index) VALUES
  (2, 'Tokyo', 'Neon city & Mt. Fuji',     '2024-01-16', '2024-01-22', 2800, 1),
  (2, 'Kyoto', 'Temples & tradition',      '2024-01-22', '2024-01-26', 1800, 2),
  (2, 'Osaka', 'Food paradise & nightlife','2024-01-26', '2024-01-29',  900, 3);

-- Stop activities for Paris stop (stop_id=1)
INSERT INTO stop_activities (stop_id, activity_id, scheduled_time, day_number) VALUES
  (1, 1, '09:00', 2),  -- Eiffel Tower, Day 2
  (1, 3, '18:00', 2),  -- Seine Cruise, Day 2
  (1, 2, '10:00', 3);  -- Louvre, Day 3

-- Stop activities for Tokyo stop (stop_id=2)
INSERT INTO stop_activities (stop_id, activity_id, scheduled_time, day_number) VALUES
  (2, 6, '08:00', 1),  -- Tsukiji, Day 1
  (2, 5, '15:00', 1),  -- Shibuya, Day 1
  (2, 4, '07:00', 3);  -- Mt. Fuji, Day 3

-- Community posts
INSERT INTO community_posts (user_id, trip_id, trip_name, content, likes, is_public) VALUES
  (2, NULL, 'Tokyo & Kyoto Adventure',
   'Just returned from 2 weeks in Japan and I''m absolutely blown away! The contrast between Tokyo''s neon chaos and Kyoto''s serene temples is unlike anything I''ve ever experienced. Pro tip: get a 14-day JR Pass — saved me over $300 on shinkansen!',
   234, TRUE),
  (3, NULL, 'Santorini Sunset Tour',
   'Oia at sunset is every bit as magical as the photos suggest. We rented a villa overlooking the caldera and it was worth every penny. The volcanic black sand beaches at Perissa were a surprise highlight!',
   187, TRUE),
  (1, 1, 'Paris Getaway',
   'Paris in January is absolutely magical — fewer tourists, crisp winter air, and the museums are blissfully uncrowded. The Louvre after dark is surreal. Highly recommend the GlobeTrotter itinerary builder for planning!',
   312, TRUE);

INSERT INTO post_tags (post_id, tag) VALUES
  (1,'Japan'),(1,'Tokyo'),(1,'Kyoto'),(1,'Budget Tips'),
  (2,'Greece'),(2,'Santorini'),(2,'Luxury'),(2,'Sunset'),
  (3,'Paris'),(3,'France'),(3,'Winter Travel'),(3,'Culture');
