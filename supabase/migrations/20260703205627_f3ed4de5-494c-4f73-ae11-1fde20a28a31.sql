
-- 1. Restrict hospitals & ambulances SELECT to authenticated users
DROP POLICY IF EXISTS "Hospitals public read" ON public.hospitals;
CREATE POLICY "Hospitals authenticated read" ON public.hospitals FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.hospitals FROM anon;

DROP POLICY IF EXISTS "Ambulances readable" ON public.ambulances;
CREATE POLICY "Ambulances authenticated read" ON public.ambulances FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.ambulances FROM anon;

-- 2. Move has_role to a private schema so PostgREST does not expose it
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Rewrite policies to use private.has_role
DROP POLICY IF EXISTS "Admin manage hospitals" ON public.hospitals;
CREATE POLICY "Admin manage hospitals" ON public.hospitals FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admin manage ambulances" ON public.ambulances;
CREATE POLICY "Admin manage ambulances" ON public.ambulances FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Staff read requests" ON public.emergency_requests;
CREATE POLICY "Staff read requests" ON public.emergency_requests FOR SELECT TO authenticated
  USING (
    private.has_role(auth.uid(), 'hospital_staff'::public.app_role)
    OR private.has_role(auth.uid(), 'ambulance'::public.app_role)
    OR private.has_role(auth.uid(), 'admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Owner reads events" ON public.emergency_events;
CREATE POLICY "Owner reads events" ON public.emergency_events FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.emergency_requests r
    WHERE r.id = emergency_events.request_id
      AND (
        r.patient_id = auth.uid()
        OR private.has_role(auth.uid(), 'admin'::public.app_role)
        OR private.has_role(auth.uid(), 'hospital_staff'::public.app_role)
        OR private.has_role(auth.uid(), 'ambulance'::public.app_role)
      )
  ));

-- Drop the exposed public.has_role now that no policies reference it
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
