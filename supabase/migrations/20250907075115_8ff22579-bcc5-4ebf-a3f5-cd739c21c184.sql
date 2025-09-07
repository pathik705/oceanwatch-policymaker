-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  organization TEXT,
  role TEXT CHECK (role IN ('researcher', 'policy_maker', 'ngo', 'citizen')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pollution incidents table
CREATE TABLE public.pollution_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  pollution_type TEXT NOT NULL CHECK (pollution_type IN ('plastic', 'oil_spill', 'debris', 'chemical', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  ai_analysis JSONB,
  status TEXT NOT NULL CHECK (status IN ('reported', 'verified', 'investigating', 'resolved')) DEFAULT 'reported',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create policies table
CREATE TABLE public.policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  document_url TEXT,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('regulation', 'law', 'guideline', 'treaty', 'standard')),
  jurisdiction TEXT,
  entities JSONB,
  key_points TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create policy matches table (linking incidents to relevant policies)
CREATE TABLE public.policy_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID NOT NULL REFERENCES public.pollution_incidents(id) ON DELETE CASCADE,
  policy_id UUID NOT NULL REFERENCES public.policies(id) ON DELETE CASCADE,
  relevance_score DECIMAL(3, 2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
  match_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(incident_id, policy_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pollution_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pollution incidents
CREATE POLICY "Anyone can view pollution incidents" ON public.pollution_incidents FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create incidents" ON public.pollution_incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own incidents" ON public.pollution_incidents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own incidents" ON public.pollution_incidents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for policies (readable by all, manageable by authenticated users)
CREATE POLICY "Anyone can view policies" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create policies" ON public.policies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update policies" ON public.policies FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for policy matches
CREATE POLICY "Anyone can view policy matches" ON public.policy_matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create matches" ON public.policy_matches FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for pollution images
INSERT INTO storage.buckets (id, name, public) VALUES ('pollution-images', 'pollution-images', true);

-- Storage policies for pollution images
CREATE POLICY "Anyone can view pollution images" ON storage.objects FOR SELECT USING (bucket_id = 'pollution-images');
CREATE POLICY "Authenticated users can upload pollution images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pollution-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (bucket_id = 'pollution-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.pollution_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'citizen')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample policies for testing
INSERT INTO public.policies (title, description, policy_type, jurisdiction, key_points) VALUES
('Marine Protection Act 2023', 'Comprehensive legislation protecting marine ecosystems from pollution', 'law', 'International', ARRAY['Prohibits discharge of plastic waste', 'Mandatory reporting of oil spills', 'Fines up to $1M for violations']),
('UN SDG 14 - Life Below Water', 'United Nations Sustainable Development Goal for ocean conservation', 'guideline', 'Global', ARRAY['Reduce marine pollution', 'Protect marine ecosystems', 'Sustainable fishing practices']),
('EU Marine Strategy Framework', 'European framework for marine environmental protection', 'regulation', 'European Union', ARRAY['Good environmental status by 2030', 'Marine pollution prevention', 'Ecosystem-based management']);