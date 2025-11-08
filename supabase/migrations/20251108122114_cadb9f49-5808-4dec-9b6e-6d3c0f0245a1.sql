-- Create profiles table for doctor information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  specialty TEXT,
  workplace TEXT,
  license_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Create a stats table to track doctor statistics
CREATE TABLE public.doctor_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_patients INTEGER DEFAULT 0,
  consultations_today INTEGER DEFAULT 0,
  notes_generated INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(doctor_id)
);

-- Enable RLS on doctor_stats
ALTER TABLE public.doctor_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for doctor_stats
CREATE POLICY "Users can view their own stats" 
ON public.doctor_stats 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Users can update their own stats" 
ON public.doctor_stats 
FOR UPDATE 
USING (auth.uid() = doctor_id);

CREATE POLICY "Users can insert their own stats" 
ON public.doctor_stats 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

-- Create trigger for doctor_stats timestamp updates
CREATE TRIGGER update_doctor_stats_updated_at
BEFORE UPDATE ON public.doctor_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();