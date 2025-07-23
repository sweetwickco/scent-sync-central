-- Create table for storing listing optimizations
CREATE TABLE public.listing_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID REFERENCES public.listings(id),
  original_data JSONB NOT NULL,
  analysis_results JSONB,
  recommendations JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listing_optimizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own optimizations" 
ON public.listing_optimizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own optimizations" 
ON public.listing_optimizations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimizations" 
ON public.listing_optimizations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own optimizations" 
ON public.listing_optimizations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_listing_optimizations_updated_at
BEFORE UPDATE ON public.listing_optimizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();