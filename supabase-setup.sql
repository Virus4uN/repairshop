-- ==============================================
-- SMART HUB REPAIR - SUPABASE DATABASE SETUP
-- ==============================================
-- Run this SQL in the Supabase SQL Editor

-- 1. USERS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'technician')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TECHNICIANS TABLE
CREATE TABLE IF NOT EXISTS public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  specialization VARCHAR(255),
  experience INT DEFAULT 0,
  availability VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  estimated_time VARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REPAIRS TABLE
CREATE TABLE IF NOT EXISTS public.repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id VARCHAR(20) UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES public.technicians(id) ON DELETE SET NULL,
  device_type VARCHAR(100) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  problem TEXT NOT NULL,
  diagnosis TEXT,
  status VARCHAR(50) DEFAULT 'request_received',
  preferred_date DATE,
  preferred_time VARCHAR(50),
  estimated_completion DATE,
  additional_notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SPARE PARTS TABLE
CREATE TABLE IF NOT EXISTS public.spare_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  quantity INT DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  supplier VARCHAR(255),
  min_stock INT DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(20) UNIQUE,
  repair_id UUID REFERENCES public.repairs(id) ON DELETE CASCADE,
  service_charge DECIMAL(10,2) DEFAULT 0,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  labour_charge DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  invoice_date TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  repair_id UUID REFERENCES public.repairs(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  service_quality VARCHAR(20),
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REPAIR HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.repair_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID REFERENCES public.repairs(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. REPAIR PARTS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.repair_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repair_id UUID REFERENCES public.repairs(id) ON DELETE CASCADE,
  part_id UUID REFERENCES public.spare_parts(id) ON DELETE SET NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0
);

-- ==============================================
-- FUNCTIONS & TRIGGERS
-- ==============================================

-- Auto-generate Repair ID (SHR-YYYY-NNNNN)
CREATE OR REPLACE FUNCTION generate_repair_id()
RETURNS TRIGGER AS $$
DECLARE
  year_str TEXT;
  seq_num INT;
  new_repair_id TEXT;
BEGIN
  year_str := EXTRACT(YEAR FROM NOW())::TEXT;
  SELECT COALESCE(MAX(CAST(SUBSTRING(repair_id FROM 10) AS INT)), 0) + 1
  INTO seq_num
  FROM public.repairs
  WHERE repair_id LIKE 'SHR-' || year_str || '-%';
  
  new_repair_id := 'SHR-' || year_str || '-' || LPAD(seq_num::TEXT, 5, '0');
  NEW.repair_id := new_repair_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_repair_id ON public.repairs;
CREATE TRIGGER trigger_generate_repair_id
  BEFORE INSERT ON public.repairs
  FOR EACH ROW
  WHEN (NEW.repair_id IS NULL)
  EXECUTE FUNCTION generate_repair_id();

-- Auto-generate Invoice Number (INV-NNNNN)
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INT)), 0) + 1
  INTO seq_num
  FROM public.invoices;
  
  NEW.invoice_number := 'INV-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON public.invoices;
CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Auto-update updated_at on repairs
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_repairs_timestamp ON public.repairs;
CREATE TRIGGER trigger_update_repairs_timestamp
  BEFORE UPDATE ON public.repairs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_parts ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Allow all for authenticated users on users" ON public.users;
CREATE POLICY "Users can read profile" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert profile" ON public.users FOR INSERT WITH CHECK (true);

-- Customers policies
DROP POLICY IF EXISTS "Full access to customers" ON public.customers;
CREATE POLICY "Full access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

-- Technicians policies
DROP POLICY IF EXISTS "Full access to technicians" ON public.technicians;
CREATE POLICY "Full access to technicians" ON public.technicians FOR ALL USING (true) WITH CHECK (true);

-- Services policies
DROP POLICY IF EXISTS "Public read services" ON public.services;
DROP POLICY IF EXISTS "Admin manage services" ON public.services;
DROP POLICY IF EXISTS "Full access to services" ON public.services;
CREATE POLICY "Full access to services" ON public.services FOR ALL USING (true) WITH CHECK (true);

-- Repairs policies
DROP POLICY IF EXISTS "Full access to repairs" ON public.repairs;
CREATE POLICY "Full access to repairs" ON public.repairs FOR ALL USING (true) WITH CHECK (true);

-- Spare Parts policies
DROP POLICY IF EXISTS "Full access to spare_parts" ON public.spare_parts;
CREATE POLICY "Full access to spare_parts" ON public.spare_parts FOR ALL USING (true) WITH CHECK (true);

-- Invoices policies
DROP POLICY IF EXISTS "Full access to invoices" ON public.invoices;
CREATE POLICY "Full access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

-- Feedback policies
DROP POLICY IF EXISTS "Full access to feedback" ON public.feedback;
CREATE POLICY "Full access to feedback" ON public.feedback FOR ALL USING (true) WITH CHECK (true);

-- Repair History policies
DROP POLICY IF EXISTS "Full access to repair_history" ON public.repair_history;
CREATE POLICY "Full access to repair_history" ON public.repair_history FOR ALL USING (true) WITH CHECK (true);

-- Repair Parts policies
DROP POLICY IF EXISTS "Full access to repair_parts" ON public.repair_parts;
CREATE POLICY "Full access to repair_parts" ON public.repair_parts FOR ALL USING (true) WITH CHECK (true);

-- ==============================================
-- AUTOMATIC USER SYNC TRIGGER (auth.users -> public.users)
-- ==============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role VARCHAR(20);
  assigned_name VARCHAR(255);
BEGIN
  -- Automatically assign admin role for primary admin email
  IF LOWER(NEW.email) = 'sc7348509580@gmail.com' THEN
    assigned_role := 'admin';
    assigned_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'System Administrator');
  ELSE
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
    assigned_name := COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1));
  END IF;

  INSERT INTO public.users (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    assigned_name,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    assigned_role
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role;

  IF assigned_role = 'customer' THEN
    INSERT INTO public.customers (user_id, full_name, email, phone)
    VALUES (
      NEW.id,
      assigned_name,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing user if sc7348509580@gmail.com was already signed up
UPDATE public.users 
SET role = 'admin' 
WHERE LOWER(email) = 'sc7348509580@gmail.com';

-- ==============================================
-- SEED DATA
-- ==============================================

-- Seed Services
INSERT INTO public.services (service_name, description, estimated_time, price, is_active) VALUES
  ('Mobile Repair', 'Screen replacement, battery replacement, charging port repair, software issues, water damage recovery, and camera repairs.', '1-3 Hours', 499, true),
  ('Laptop Repair', 'Screen replacement, keyboard repair, motherboard repair, RAM/SSD upgrades, hinge repair, and virus removal.', '2-24 Hours', 799, true),
  ('Computer Repair', 'Hardware troubleshooting, component replacement, OS installation, network setup, and data recovery.', '2-24 Hours', 599, true),
  ('Tablet Repair', 'Screen replacement, battery replacement, charging issues, button repair, and software updates.', '1-4 Hours', 699, true),
  ('Printer Repair', 'Paper jam fix, ink system repair, connectivity issues, print head cleaning, and hardware replacement.', '2-6 Hours', 499, true),
  ('Electronics Repair', 'Gaming consoles, smartwatches, routers, speakers, power banks, and home electronics repair.', '2-48 Hours', 399, true)
ON CONFLICT DO NOTHING;

-- Seed Spare Parts
INSERT INTO public.spare_parts (part_name, category, quantity, price, supplier, min_stock) VALUES
  ('iPhone Screen', 'Mobile', 15, 2500, 'Apple Parts Co.', 5),
  ('Samsung Battery', 'Mobile', 20, 800, 'Samsung Parts', 5),
  ('Laptop Screen 15.6"', 'Laptop', 8, 4500, 'Display Tech', 3),
  ('Laptop Keyboard', 'Laptop', 12, 1200, 'KeyParts India', 5),
  ('SSD 256GB', 'Computer', 10, 2800, 'StoragePro', 3),
  ('RAM 8GB DDR4', 'Computer', 15, 1800, 'Memory India', 5),
  ('Charging Port Type-C', 'Mobile', 25, 300, 'Connector Hub', 10),
  ('iPad Screen', 'Tablet', 5, 3500, 'Tablet Parts Co.', 3),
  ('Printer Drum', 'Printer', 6, 2200, 'PrintParts', 3),
  ('Ink Cartridge Set', 'Printer', 20, 1500, 'InkWorld', 5)
ON CONFLICT DO NOTHING;

SELECT 'Database setup completed successfully!' AS status;
