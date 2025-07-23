-- Create table for business plans
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  fields_data JSONB,
  ai_generated_plan JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for plan tasks
CREATE TABLE public.plan_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for todo tasks
CREATE TABLE public.todo_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for supply categories
CREATE TABLE public.supply_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for supplies
CREATE TABLE public.supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.supply_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vendor TEXT,
  price NUMERIC,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for product categories
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.product_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for product supplies (recipe/formula)
CREATE TABLE public.product_supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supply_id UUID NOT NULL REFERENCES public.supplies(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for production batches
CREATE TABLE public.production_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  batch_size INTEGER NOT NULL,
  calculated_supplies JSONB,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plans
CREATE POLICY "Users can view their own plans" ON public.plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own plans" ON public.plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plans" ON public.plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plans" ON public.plans FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for plan_tasks
CREATE POLICY "Users can view tasks from their plans" ON public.plan_tasks FOR SELECT USING (EXISTS (SELECT 1 FROM public.plans WHERE id = plan_tasks.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can create tasks for their plans" ON public.plan_tasks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.plans WHERE id = plan_tasks.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can update tasks from their plans" ON public.plan_tasks FOR UPDATE USING (EXISTS (SELECT 1 FROM public.plans WHERE id = plan_tasks.plan_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete tasks from their plans" ON public.plan_tasks FOR DELETE USING (EXISTS (SELECT 1 FROM public.plans WHERE id = plan_tasks.plan_id AND user_id = auth.uid()));

-- Create RLS policies for todo_tasks
CREATE POLICY "Users can view their own todo tasks" ON public.todo_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own todo tasks" ON public.todo_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own todo tasks" ON public.todo_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own todo tasks" ON public.todo_tasks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for supply_categories
CREATE POLICY "Users can view their own supply categories" ON public.supply_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own supply categories" ON public.supply_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own supply categories" ON public.supply_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own supply categories" ON public.supply_categories FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for supplies
CREATE POLICY "Users can view their own supplies" ON public.supplies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own supplies" ON public.supplies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own supplies" ON public.supplies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own supplies" ON public.supplies FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for product_categories
CREATE POLICY "Users can view their own product categories" ON public.product_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own product categories" ON public.product_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own product categories" ON public.product_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own product categories" ON public.product_categories FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for products
CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for product_supplies
CREATE POLICY "Users can view supplies for their products" ON public.product_supplies FOR SELECT USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_supplies.product_id AND user_id = auth.uid()));
CREATE POLICY "Users can create supplies for their products" ON public.product_supplies FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.products WHERE id = product_supplies.product_id AND user_id = auth.uid()));
CREATE POLICY "Users can update supplies for their products" ON public.product_supplies FOR UPDATE USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_supplies.product_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete supplies for their products" ON public.product_supplies FOR DELETE USING (EXISTS (SELECT 1 FROM public.products WHERE id = product_supplies.product_id AND user_id = auth.uid()));

-- Create RLS policies for production_batches
CREATE POLICY "Users can view their own production batches" ON public.production_batches FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own production batches" ON public.production_batches FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own production batches" ON public.production_batches FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own production batches" ON public.production_batches FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_todo_tasks_updated_at BEFORE UPDATE ON public.todo_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supply_categories_updated_at BEFORE UPDATE ON public.supply_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON public.supplies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_supplies_updated_at BEFORE UPDATE ON public.product_supplies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON public.production_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate product COGS
CREATE OR REPLACE FUNCTION public.calculate_product_cogs(product_uuid uuid)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  total_cogs NUMERIC := 0;
  supply_cost NUMERIC;
  supply_quantity NUMERIC;
  supply_price NUMERIC;
BEGIN
  FOR supply_cost, supply_quantity, supply_price IN
    SELECT 
      ps.quantity,
      ps.quantity,
      s.price
    FROM public.product_supplies ps
    JOIN public.supplies s ON ps.supply_id = s.id
    WHERE ps.product_id = product_uuid
  LOOP
    total_cogs := total_cogs + (supply_quantity * COALESCE(supply_price, 0));
  END LOOP;
  
  RETURN total_cogs;
END;
$function$;