-- Full Schema and RLS Policies Migration for demanager

-- Create regions table
CREATE TABLE public.regions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  district TEXT,
  physical_location TEXT
);

-- Create inventory table
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  smartcard TEXT NOT NULL UNIQUE,
  serial_number TEXT NOT NULL UNIQUE,
  batch_number TEXT,
  stock_type TEXT NOT NULL CHECK (stock_type IN ('full_set', 'decoder_only')),
  status TEXT NOT NULL DEFAULT 'in_store' CHECK (status IN ('in_store', 'in_hand', 'sold')),
  region_id UUID REFERENCES public.regions(id) ON DELETE SET NULL,
  assigned_to_agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sale_type TEXT NOT NULL CHECK (sale_type IN ('normal', 'dvs')),
  package_type TEXT,
  sale_price DECIMAL(10,2),
  customer_name TEXT,
  customer_phone TEXT,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bulkupload table
CREATE TABLE IF NOT EXISTS bulkupload (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  smartcard text NOT NULL,
  serial_number text NOT NULL,
  region text NOT NULL,
  stock_type text NOT NULL,
  package text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulkupload ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can search inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Public can view regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Public can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Public can view agents" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public can view sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Public can view bulkupload" ON bulkupload FOR SELECT USING (true);

-- Admin full access policies
CREATE POLICY "Admins can do everything on regions" ON public.regions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can do everything on teams" ON public.teams FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can do everything on agents" ON public.agents FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can do everything on inventory" ON public.inventory FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can do everything on sales" ON public.sales FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can view admin_users" ON public.admin_users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage admin_users" ON public.admin_users FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can do everything on bulkupload" ON bulkupload FOR ALL USING (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment agent sales count
CREATE OR REPLACE FUNCTION public.increment_agent_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.agent_id IS NOT NULL THEN
    UPDATE public.agents SET total_sales = total_sales + 1 WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_sale_created
  AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.increment_agent_sales();

-- Create indexes for better performance
CREATE INDEX idx_inventory_smartcard ON public.inventory(smartcard);
CREATE INDEX idx_inventory_serial ON public.inventory(serial_number);
CREATE INDEX idx_inventory_status ON public.inventory(status);
CREATE INDEX idx_inventory_agent ON public.inventory(assigned_to_agent_id);
CREATE INDEX idx_sales_agent ON public.sales(agent_id);
CREATE INDEX idx_agents_team ON public.agents(team_id);
CREATE INDEX IF NOT EXISTS idx_agents_region ON public.agents(region_id);
