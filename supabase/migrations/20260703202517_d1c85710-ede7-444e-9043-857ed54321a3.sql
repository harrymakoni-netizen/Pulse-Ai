
-- Enums
CREATE TYPE public.app_role AS ENUM ('patient','hospital_staff','ambulance','admin');
CREATE TYPE public.emergency_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE public.emergency_status AS ENUM ('requested','assessed','hospital_notified','dispatched','en_route','arrived','transporting','completed','cancelled');
CREATE TYPE public.ambulance_status AS ENUM ('available','dispatched','en_route','on_scene','transporting','offline');
CREATE TYPE public.preferred_language AS ENUM ('en','sn','nd');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  language public.preferred_language NOT NULL DEFAULT 'en',
  blood_type TEXT,
  allergies TEXT[],
  medications TEXT[],
  dob DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  hospital_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Emergency contacts
CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relation TEXT,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own contacts" ON public.emergency_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Hospitals
CREATE TABLE public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  phone TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  total_beds INTEGER NOT NULL DEFAULT 0,
  available_beds INTEGER NOT NULL DEFAULT 0,
  has_emergency BOOLEAN NOT NULL DEFAULT true,
  rating NUMERIC(2,1) DEFAULT 4.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hospitals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hospitals TO authenticated;
GRANT ALL ON public.hospitals TO service_role;
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hospitals public read" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Admin manage hospitals" ON public.hospitals FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Ambulances
CREATE TABLE public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  plate TEXT NOT NULL,
  status public.ambulance_status NOT NULL DEFAULT 'available',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ambulances TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambulances TO authenticated;
GRANT ALL ON public.ambulances TO service_role;
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ambulances readable" ON public.ambulances FOR SELECT USING (true);
CREATE POLICY "Admin manage ambulances" ON public.ambulances FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Emergency requests
CREATE TABLE public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  symptoms_text TEXT,
  pain_level INTEGER,
  age INTEGER,
  medical_history TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  location_label TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  severity public.emergency_severity,
  ai_summary JSONB,
  ai_report TEXT,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  ambulance_id UUID REFERENCES public.ambulances(id) ON DELETE SET NULL,
  status public.emergency_status NOT NULL DEFAULT 'requested',
  eta_minutes INTEGER,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_requests TO authenticated;
GRANT ALL ON public.emergency_requests TO service_role;
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patient manage own requests" ON public.emergency_requests FOR ALL TO authenticated USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Staff read requests" ON public.emergency_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'hospital_staff') OR public.has_role(auth.uid(),'ambulance') OR public.has_role(auth.uid(),'admin'));

-- Emergency events (timeline)
CREATE TABLE public.emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  status public.emergency_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.emergency_events TO authenticated;
GRANT ALL ON public.emergency_events TO service_role;
ALTER TABLE public.emergency_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads events" ON public.emergency_events FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.emergency_requests r WHERE r.id = request_id AND (r.patient_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'hospital_staff') OR public.has_role(auth.uid(),'ambulance')))
);
CREATE POLICY "Owner inserts events" ON public.emergency_events FOR INSERT TO authenticated WITH CHECK (
  EXISTS(SELECT 1 FROM public.emergency_requests r WHERE r.id = request_id AND r.patient_id = auth.uid())
);

-- Medical records
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  details JSONB,
  file_url TEXT,
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own records" ON public.medical_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE SET NULL,
  doctor_name TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create profile and default patient role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'patient'))
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER requests_touch BEFORE UPDATE ON public.emergency_requests FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
