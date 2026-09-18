REVOKE ALL ON FUNCTION public.increment_total_amount(bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_total_amount(bigint) TO service_role;