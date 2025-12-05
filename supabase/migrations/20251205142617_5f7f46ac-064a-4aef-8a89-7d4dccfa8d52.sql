-- Create enum for the 10 irrational thinking components
CREATE TYPE public.thinking_component AS ENUM (
  'all_or_nothing',
  'overgeneralization', 
  'mental_filter',
  'disqualifying_positive',
  'jumping_conclusions',
  'magnification',
  'emotional_reasoning',
  'should_statements',
  'labeling',
  'personalization'
);

-- Components table - stores the 10 irrational thinking components
CREATE TABLE public.components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_key thinking_component UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  examples TEXT NOT NULL DEFAULT '',
  pdf_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 10 default components
INSERT INTO public.components (component_key, name, description, examples, display_order) VALUES
('all_or_nothing', 'All-or-Nothing Thinking', 'You see things in black-and-white categories. If your performance falls short of perfect, you see yourself as a total failure.', 'If I don''t get an A, I''m a complete failure. If this relationship isn''t perfect, it''s worthless.', 1),
('overgeneralization', 'Overgeneralization', 'You see a single negative event as a never-ending pattern of defeat.', 'I got rejected once, so I''ll always be rejected. I failed this test, so I''ll fail everything.', 2),
('mental_filter', 'Mental Filter', 'You pick out a single negative detail and dwell on it exclusively so that your vision of all reality becomes darkened.', 'Focusing on the one criticism in an otherwise positive review. Remembering only the bad parts of a vacation.', 3),
('disqualifying_positive', 'Disqualifying the Positive', 'You reject positive experiences by insisting they "don''t count" for some reason.', 'They only said that to be nice. That success was just luck, not my ability.', 4),
('jumping_conclusions', 'Jumping to Conclusions', 'You make a negative interpretation even though there are no definite facts that convincingly support your conclusion.', 'Mind Reading: They must think I''m boring. Fortune Telling: This will definitely go wrong.', 5),
('magnification', 'Magnification or Minimization', 'You exaggerate the importance of things or you inappropriately shrink things until they appear tiny.', 'A small mistake feels like a disaster. Your achievements seem insignificant compared to others.', 6),
('emotional_reasoning', 'Emotional Reasoning', 'You assume that your negative emotions necessarily reflect the way things really are.', 'I feel anxious, so something bad must be about to happen. I feel guilty, so I must have done something wrong.', 7),
('should_statements', 'Should Statements', 'You try to motivate yourself with shoulds and shouldn''ts, as if you had to be whipped and punished before you could be expected to do anything.', 'I should always be productive. I shouldn''t make mistakes. Others should treat me fairly.', 8),
('labeling', 'Labeling and Mislabeling', 'Instead of describing your error, you attach a negative label to yourself.', 'I''m a loser. I''m stupid. They''re a jerk.', 9),
('personalization', 'Personalization', 'You see yourself as the cause of some negative external event which in fact you were not primarily responsible for.', 'It''s my fault the team failed. If I had done more, this wouldn''t have happened.', 10);

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Question options table
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  component_key thinking_component NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quiz submissions table (stores user results)
CREATE TABLE public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  component_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  top_components thinking_component[] NOT NULL DEFAULT '{}',
  has_purchased BOOLEAN NOT NULL DEFAULT false,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Email settings table
CREATE TABLE public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_email TEXT NOT NULL DEFAULT 'hello@mindprofile.com',
  sender_name TEXT NOT NULL DEFAULT 'MindProfile',
  subject TEXT NOT NULL DEFAULT 'Your Personalized MindProfile Ebook',
  body_template TEXT NOT NULL DEFAULT 'Hi {{user_name}},

Thank you for taking the MindProfile quiz!

Based on your results, your top thinking patterns are:
1. {{component_1}}
2. {{component_2}}
3. {{component_3}}

Download your personalized ebook modules:
{{ebook_links}}

Best regards,
The MindProfile Team',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default email settings
INSERT INTO public.email_settings (id) VALUES (gen_random_uuid());

-- Admin roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Public read policies for quiz functionality
CREATE POLICY "Components are publicly readable" ON public.components FOR SELECT USING (true);
CREATE POLICY "Active questions are publicly readable" ON public.questions FOR SELECT USING (is_active = true);
CREATE POLICY "Question options are publicly readable" ON public.question_options FOR SELECT USING (true);

-- Quiz submission policies
CREATE POLICY "Anyone can create quiz submissions" ON public.quiz_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read their own submissions by email" ON public.quiz_submissions FOR SELECT USING (true);
CREATE POLICY "Admins can read all submissions" ON public.quiz_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update submissions" ON public.quiz_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only write policies
CREATE POLICY "Admins can manage components" ON public.components FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage questions" ON public.questions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage question options" ON public.question_options FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage email settings" ON public.email_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Email settings publicly readable" ON public.email_settings FOR SELECT USING (true);

-- User roles policies
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for PDF modules
INSERT INTO storage.buckets (id, name, public) VALUES ('pdf-modules', 'pdf-modules', true);

-- Storage policies
CREATE POLICY "PDF modules are publicly readable" ON storage.objects FOR SELECT USING (bucket_id = 'pdf-modules');
CREATE POLICY "Admins can upload PDF modules" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'pdf-modules' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update PDF modules" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'pdf-modules' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete PDF modules" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'pdf-modules' AND public.has_role(auth.uid(), 'admin'));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON public.components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_email_settings_updated_at BEFORE UPDATE ON public.email_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample questions
INSERT INTO public.questions (question_text, display_order) VALUES
('When you make a small mistake at work, what is your typical thought?', 1),
('When someone doesn''t respond to your message quickly, what do you usually think?', 2),
('After receiving feedback with one criticism among several compliments, what stands out most?', 3),
('When something good happens to you, how do you typically explain it?', 4),
('When planning for an important event, what thoughts come to mind?', 5);

-- Insert sample options for question 1
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I''m a complete failure at my job', 'all_or_nothing', 1 FROM public.questions q WHERE q.display_order = 1;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'This always happens - I can never do anything right', 'overgeneralization', 2 FROM public.questions q WHERE q.display_order = 1;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I focus on the mistake and can''t stop thinking about it', 'mental_filter', 3 FROM public.questions q WHERE q.display_order = 1;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I should never make mistakes like this', 'should_statements', 4 FROM public.questions q WHERE q.display_order = 1;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I''m such an idiot', 'labeling', 5 FROM public.questions q WHERE q.display_order = 1;

-- Insert sample options for question 2
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'They must be angry at me', 'jumping_conclusions', 1 FROM public.questions q WHERE q.display_order = 2;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I feel anxious, so something must be wrong', 'emotional_reasoning', 2 FROM public.questions q WHERE q.display_order = 2;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'They should respond to me promptly', 'should_statements', 3 FROM public.questions q WHERE q.display_order = 2;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I must have done something to upset them', 'personalization', 4 FROM public.questions q WHERE q.display_order = 2;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'They''re so rude for not responding', 'labeling', 5 FROM public.questions q WHERE q.display_order = 2;

-- Insert sample options for question 3
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'The compliments don''t matter - they were just being nice', 'disqualifying_positive', 1 FROM public.questions q WHERE q.display_order = 3;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I can only focus on the one criticism', 'mental_filter', 2 FROM public.questions q WHERE q.display_order = 3;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'This criticism is huge - it overshadows everything good', 'magnification', 3 FROM public.questions q WHERE q.display_order = 3;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I''m such a failure if I have any criticism at all', 'all_or_nothing', 4 FROM public.questions q WHERE q.display_order = 3;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'They always find something wrong with my work', 'overgeneralization', 5 FROM public.questions q WHERE q.display_order = 3;

-- Insert sample options for question 4
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'It was just luck - I don''t deserve it', 'disqualifying_positive', 1 FROM public.questions q WHERE q.display_order = 4;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'It''s not that big of a deal anyway', 'magnification', 2 FROM public.questions q WHERE q.display_order = 4;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'This success doesn''t count because it was easy', 'disqualifying_positive', 3 FROM public.questions q WHERE q.display_order = 4;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'They only gave this to me because they feel sorry for me', 'jumping_conclusions', 4 FROM public.questions q WHERE q.display_order = 4;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'One success doesn''t make me successful overall', 'all_or_nothing', 5 FROM public.questions q WHERE q.display_order = 4;

-- Insert sample options for question 5
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'It''s definitely going to be a disaster', 'jumping_conclusions', 1 FROM public.questions q WHERE q.display_order = 5;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'If anything goes wrong, it will ruin everything', 'all_or_nothing', 2 FROM public.questions q WHERE q.display_order = 5;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'I feel nervous so it must be doomed', 'emotional_reasoning', 3 FROM public.questions q WHERE q.display_order = 5;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'If it fails, it''s all my fault', 'personalization', 4 FROM public.questions q WHERE q.display_order = 5;
INSERT INTO public.question_options (question_id, option_text, component_key, display_order)
SELECT q.id, 'Events like this never go well for me', 'overgeneralization', 5 FROM public.questions q WHERE q.display_order = 5;