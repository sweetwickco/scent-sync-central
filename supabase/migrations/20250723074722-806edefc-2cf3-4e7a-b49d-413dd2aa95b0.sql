-- Create new_product_ideas table
CREATE TABLE public.new_product_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  collection_targeting TEXT,
  description TEXT,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.new_product_ideas ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own new product ideas" 
ON public.new_product_ideas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own new product ideas" 
ON public.new_product_ideas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own new product ideas" 
ON public.new_product_ideas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own new product ideas" 
ON public.new_product_ideas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_new_product_ideas_updated_at
BEFORE UPDATE ON public.new_product_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();