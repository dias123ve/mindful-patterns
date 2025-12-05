-- Create component_pdfs pivot table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.component_pdfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id uuid NOT NULL REFERENCES public.components(id) ON DELETE CASCADE,
  pdf_id uuid NOT NULL REFERENCES public.pdf_documents(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(component_id, pdf_id)
);

-- Enable RLS
ALTER TABLE public.component_pdfs ENABLE ROW LEVEL SECURITY;

-- RLS policies for component_pdfs
CREATE POLICY "Component PDFs are publicly readable"
ON public.component_pdfs
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage component PDFs"
ON public.component_pdfs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add file_name column to pdf_documents if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'pdf_documents' 
    AND column_name = 'file_name'
  ) THEN
    ALTER TABLE public.pdf_documents ADD COLUMN file_name text;
  END IF;
END $$;

-- Add category column to questions for quiz organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'category'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN category text;
  END IF;
END $$;

-- Add correct_answer column to questions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'correct_answer'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN correct_answer text;
  END IF;
END $$;

-- Rename title to file_name in pdf_documents if title exists but file_name doesn't have data
UPDATE public.pdf_documents SET file_name = title WHERE file_name IS NULL AND title IS NOT NULL;