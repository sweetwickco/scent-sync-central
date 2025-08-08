-- Create documents table
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Document',
  content text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create document_tabs table
CREATE TABLE public.document_tabs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Tab',
  content text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_tabs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for document_tabs
CREATE POLICY "Users can view tabs for their documents" 
ON public.document_tabs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_tabs.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create tabs for their documents" 
ON public.document_tabs 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_tabs.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update tabs for their documents" 
ON public.document_tabs 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_tabs.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete tabs for their documents" 
ON public.document_tabs 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = document_tabs.document_id 
  AND documents.user_id = auth.uid()
));

-- Create trigger for updating updated_at timestamps
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_tabs_updated_at
BEFORE UPDATE ON public.document_tabs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_document_tabs_document_id ON public.document_tabs(document_id);
CREATE INDEX idx_document_tabs_order ON public.document_tabs(document_id, order_index);