
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID, -- References auth.users or profiles if RLS allows, but usually we just store the ID
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT, -- changed to TEXT to support various ID types (UUID or Int)
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserts from service role (backend)
-- Allow admins to view logs (optional, if we build a UI later)
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
