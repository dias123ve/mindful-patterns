-- Add positive/negative fields to components table
ALTER TABLE public.components 
ADD COLUMN IF NOT EXISTS description_positive text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS example_positive text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS pdf_positive_url text,
ADD COLUMN IF NOT EXISTS description_negative text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS example_negative text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS pdf_negative_url text;

-- Migrate existing data: copy description to description_positive, examples to example_positive
UPDATE public.components 
SET description_positive = COALESCE(description, ''),
    example_positive = COALESCE(examples, '');

-- Create storage bucket for components-positive
INSERT INTO storage.buckets (id, name, public) 
VALUES ('components-positive', 'components-positive', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for components-negative
INSERT INTO storage.buckets (id, name, public) 
VALUES ('components-negative', 'components-negative', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for components-positive bucket
CREATE POLICY "Public read access for components-positive"
ON storage.objects FOR SELECT
USING (bucket_id = 'components-positive');

CREATE POLICY "Admins can upload to components-positive"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'components-positive' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update components-positive"
ON storage.objects FOR UPDATE
USING (bucket_id = 'components-positive' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete from components-positive"
ON storage.objects FOR DELETE
USING (bucket_id = 'components-positive' AND has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for components-negative bucket
CREATE POLICY "Public read access for components-negative"
ON storage.objects FOR SELECT
USING (bucket_id = 'components-negative');

CREATE POLICY "Admins can upload to components-negative"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'components-negative' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update components-negative"
ON storage.objects FOR UPDATE
USING (bucket_id = 'components-negative' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete from components-negative"
ON storage.objects FOR DELETE
USING (bucket_id = 'components-negative' AND has_role(auth.uid(), 'admin'::app_role));