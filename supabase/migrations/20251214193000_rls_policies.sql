-- RLS Policies for demanager

-- admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin_users" ON admin_users
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage admin_users" ON admin_users
  FOR ALL USING (auth.uid() IS NOT NULL);

-- agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view agents" ON agents
  FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on agents" ON agents
  FOR ALL USING (auth.uid() IS NOT NULL);

-- inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can search inventory" ON inventory
  FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on inventory" ON inventory
  FOR ALL USING (auth.uid() IS NOT NULL);

-- regions
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view regions" ON regions
  FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on regions" ON regions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view sales" ON sales
  FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on sales" ON sales
  FOR ALL USING (auth.uid() IS NOT NULL);

-- teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view teams" ON teams
  FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on teams" ON teams
  FOR ALL USING (auth.uid() IS NOT NULL);

-- bulkupload (new table)
CREATE TABLE IF NOT EXISTS bulkupload (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smartcard text NOT NULL,
  serial_number text NOT NULL,
  region text NOT NULL,
  stock_type text NOT NULL,
  package text,
  created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE bulkupload ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view bulkupload" ON bulkupload
  FOR SELECT USING (true);
CREATE POLICY "Admins can do everything on bulkupload" ON bulkupload
  FOR ALL USING (auth.uid() IS NOT NULL);
