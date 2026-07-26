
INSERT INTO public.hospitals (name, address, city, lat, lng, phone, specialties, total_beds, available_beds, has_emergency, rating) VALUES
-- Nyanga
('Nyanga District Hospital', 'Hospital Rd, Nyanga', 'Nyanga', -18.2167, 32.7500, '+263 29 8342', ARRAY['General','Emergency','Maternity']::text[], 120, 34, true, 4.3),
('Nyanga Rural Health Centre', 'Nyangani Rd, Nyanga', 'Nyanga', -18.2255, 32.7412, '+263 29 8410', ARRAY['General','Primary Care']::text[], 45, 18, false, 4.1),
('Troutbeck Medical Clinic', 'Troutbeck, Nyanga', 'Nyanga', -18.3050, 32.8320, '+263 29 8501', ARRAY['General','Trauma']::text[], 30, 12, true, 4.5),
('Nyafaru Clinic', 'Nyafaru, Nyanga', 'Nyanga', -18.1780, 32.6790, '+263 29 8620', ARRAY['Primary Care','Maternity']::text[], 24, 9, false, 4.0),
('Ruwangwe Rural Hospital', 'Ruwangwe, Nyanga', 'Nyanga', -18.3540, 32.9210, '+263 29 8711', ARRAY['General','Emergency']::text[], 60, 22, true, 4.2),
-- Mutare
('Mutare Provincial Hospital', 'Aerodrome Rd, Mutare', 'Mutare', -18.9707, 32.6709, '+263 20 64321', ARRAY['General','Emergency','ICU','Surgery','Maternity']::text[], 350, 78, true, 4.4),
('Mutare City Hospital', 'Herbert Chitepo St, Mutare', 'Mutare', -18.9750, 32.6685, '+263 20 61240', ARRAY['General','Emergency','Paediatrics']::text[], 180, 44, true, 4.2),
('Victoria Chitepo Hospital', 'Chimoio Ave, Mutare', 'Mutare', -18.9821, 32.6790, '+263 20 60555', ARRAY['General','Cardiology','Emergency']::text[], 140, 36, true, 4.3),
('Sakubva Polyclinic', 'Sakubva, Mutare', 'Mutare', -18.9910, 32.6480, '+263 20 65710', ARRAY['Primary Care','Maternity']::text[], 60, 24, false, 4.0),
('Dangamvura Clinic', 'Dangamvura, Mutare', 'Mutare', -18.9640, 32.7020, '+263 20 68120', ARRAY['Primary Care']::text[], 40, 16, false, 3.9),
('Manicaland Cancer Centre', 'Fifth Ave, Mutare', 'Mutare', -18.9698, 32.6741, '+263 20 62880', ARRAY['Oncology','Radiology']::text[], 55, 12, false, 4.6),
('Hillside Medical Clinic', 'Hillside, Mutare', 'Mutare', -18.9612, 32.6620, '+263 20 66900', ARRAY['General','Emergency']::text[], 80, 28, true, 4.4),
-- Rusape
('Rusape General Hospital', 'Hospital Rd, Rusape', 'Rusape', -18.5372, 32.1275, '+263 25 2345', ARRAY['General','Emergency','Maternity','Surgery']::text[], 160, 42, true, 4.2),
('Vengere Clinic', 'Vengere Township, Rusape', 'Rusape', -18.5410, 32.1189, '+263 25 2610', ARRAY['Primary Care','Paediatrics']::text[], 45, 20, false, 4.0),
('Rusape District Health Centre', 'Main St, Rusape', 'Rusape', -18.5333, 32.1301, '+263 25 2500', ARRAY['General','Emergency']::text[], 90, 30, true, 4.1),
('Tsanzaguru Rural Clinic', 'Tsanzaguru, Rusape', 'Rusape', -18.5670, 32.0910, '+263 25 2712', ARRAY['Primary Care']::text[], 28, 11, false, 3.9),
('Weya Mission Hospital', 'Weya, Rusape', 'Rusape', -18.4890, 32.1780, '+263 25 2830', ARRAY['General','Maternity','Emergency']::text[], 75, 25, true, 4.3);
