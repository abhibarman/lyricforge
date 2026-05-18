-- Run this once in Supabase SQL Editor if API routes return:
-- "permission denied for table profiles"

grant usage on schema public to service_role;
grant select, insert, update on public.profiles to service_role;
grant select, insert, update on public.generation_log to service_role;

grant execute on function public.reserve_generation_credit(uuid) to service_role;
grant execute on function public.refund_reserved_credit(uuid) to service_role;
grant execute on function public.log_generation(uuid, text, text, integer) to service_role;
grant execute on function public.deduct_credit_and_log(uuid, text, text) to service_role;
