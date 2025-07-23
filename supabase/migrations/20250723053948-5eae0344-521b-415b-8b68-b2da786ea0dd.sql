-- Create enum types
CREATE TYPE public.listing_status AS ENUM ('active', 'inactive', 'draft', 'sold');
CREATE TYPE public.sync_status AS ENUM ('pending', 'syncing', 'success', 'error');
CREATE TYPE public.platform_type AS ENUM ('etsy', 'woocommerce');

-- Create platforms table
CREATE TABLE public.platforms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type platform_type NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default platforms
INSERT INTO public.platforms (name, type) VALUES 
  ('Etsy', 'etsy'),
  ('WooCommerce', 'woocommerce');

-- Create fragrances table
CREATE TABLE public.fragrances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  current_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  price DECIMAL(10,2),
  cost DECIMAL(10,2),
  weight DECIMAL(8,2),
  dimensions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fragrance_id UUID NOT NULL REFERENCES public.fragrances(id) ON DELETE CASCADE,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  external_id TEXT, -- Platform-specific listing ID
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status listing_status NOT NULL DEFAULT 'draft',
  url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(fragrance_id, platform_id)
);

-- Create sync_logs table
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE CASCADE,
  operation TEXT NOT NULL, -- 'sync_inventory', 'create_listing', 'update_listing', etc.
  status sync_status NOT NULL DEFAULT 'pending',
  message TEXT,
  details JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fragrances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (for now, allow all operations for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON public.platforms FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.fragrances FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.listings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON public.sync_logs FOR ALL TO authenticated USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fragrances_updated_at BEFORE UPDATE ON public.fragrances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to get fragrance status based on stock
CREATE OR REPLACE FUNCTION public.get_fragrance_status(stock INTEGER, threshold INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF stock = 0 THEN
    RETURN 'out-of-stock';
  ELSIF stock <= threshold THEN
    RETURN 'low-stock';
  ELSE
    RETURN 'in-stock';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get listing counts for a fragrance
CREATE OR REPLACE FUNCTION public.get_listing_counts(fragrance_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  etsy_count INTEGER;
  woo_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO etsy_count 
  FROM public.listings l 
  JOIN public.platforms p ON l.platform_id = p.id 
  WHERE l.fragrance_id = fragrance_uuid AND p.type = 'etsy' AND l.status = 'active';
  
  SELECT COUNT(*) INTO woo_count 
  FROM public.listings l 
  JOIN public.platforms p ON l.platform_id = p.id 
  WHERE l.fragrance_id = fragrance_uuid AND p.type = 'woocommerce' AND l.status = 'active';
  
  RETURN json_build_object('etsy', etsy_count, 'woocommerce', woo_count);
END;
$$ LANGUAGE plpgsql;