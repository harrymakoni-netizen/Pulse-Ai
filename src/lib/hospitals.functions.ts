import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listHospitals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
  const { data, error } = await context.supabase
    .from("hospitals")
    .select("id,name,address,city,lat,lng,phone,specialties,total_beds,available_beds,has_emergency,rating")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});