-- ============================================================
-- TILANCHILIK.UZ — jonli summa uchun atomik oshirish funksiyasi
-- Ikki donat bir vaqtda kelsa ham (race condition'siz) to'g'ri qo'shiladi:
-- read-modify-write o'rniga bitta SQL UPDATE ichida hisoblanadi.
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_total_amount(delta bigint)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total bigint;
BEGIN
  IF delta IS NULL OR delta < 0 OR delta > 1000000000 THEN
    RAISE EXCEPTION 'invalid delta';
  END IF;

  UPDATE public.site_settings
     SET total_amount = total_amount + delta,
         updated_at = now()
   WHERE id = 1
   RETURNING total_amount INTO new_total;

  RETURN new_total;
END;
$$;

-- Only the trusted server (service_role, via admin.functions.ts) calls this —
-- it is never exposed to anon/authenticated directly.
REVOKE ALL ON FUNCTION public.increment_total_amount(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_total_amount(bigint) TO service_role;
