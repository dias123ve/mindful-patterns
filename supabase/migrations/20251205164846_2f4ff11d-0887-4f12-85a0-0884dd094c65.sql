-- Add component_key to questions table
ALTER TABLE questions ADD COLUMN component_key text;

-- Add score column to question_options
ALTER TABLE question_options ADD COLUMN score integer DEFAULT 1;

-- Drop component_key from question_options (we'll do this after migrating data)
ALTER TABLE question_options DROP COLUMN component_key;

-- Create pdf_documents table for storing PDF metadata
CREATE TABLE public.pdf_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on pdf_documents
ALTER TABLE public.pdf_documents ENABLE ROW LEVEL SECURITY;

-- Admins can manage PDF documents
CREATE POLICY "Admins can manage pdf documents" 
ON public.pdf_documents 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- PDF documents are publicly readable
CREATE POLICY "PDF documents are publicly readable" 
ON public.pdf_documents 
FOR SELECT 
USING (true);