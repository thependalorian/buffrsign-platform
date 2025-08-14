-- Seed subscription plans (example)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  monthly_price NUMERIC NOT NULL,
  yearly_price NUMERIC NOT NULL,
  document_limit INTEGER,
  user_limit INTEGER
);

INSERT INTO subscription_plans (name, monthly_price, yearly_price, document_limit, user_limit) VALUES
  ('Individual', 150, 1500, 5, 1)
ON CONFLICT (name) DO NOTHING;

INSERT INTO subscription_plans (name, monthly_price, yearly_price, document_limit, user_limit) VALUES
  ('Small Business', 400, 4000, 50, 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO subscription_plans (name, monthly_price, yearly_price, document_limit, user_limit) VALUES
  ('Enterprise', 1200, 12000, 500, 25)
ON CONFLICT (name) DO NOTHING;

INSERT INTO subscription_plans (name, monthly_price, yearly_price, document_limit, user_limit) VALUES
  ('Government', 2000, 20000, 1000, 50)
ON CONFLICT (name) DO NOTHING;
