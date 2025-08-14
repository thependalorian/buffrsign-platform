-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Basic policies (adjust in production)
CREATE POLICY IF NOT EXISTS users_self_read ON users
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS documents_owner_rw ON documents
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS recipients_doc_read ON recipients
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS signatures_doc_read ON signatures
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS audit_trail_doc_read ON audit_trail
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS templates_public_read ON templates
  FOR SELECT USING (is_public IS TRUE);
