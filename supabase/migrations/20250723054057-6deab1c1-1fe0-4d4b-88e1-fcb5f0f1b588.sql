-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function search path for get_fragrance_status
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Fix function search path for get_listing_counts
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';