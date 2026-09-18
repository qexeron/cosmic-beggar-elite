-- POSTS
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media_url  text,
  ADD COLUMN IF NOT EXISTS media_kind text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS sticker    text,
  ADD COLUMN IF NOT EXISTS pinned     boolean NOT NULL DEFAULT false;

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_media_kind_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_media_kind_check CHECK (media_kind IN ('image','gif','video','none'));

UPDATE public.posts
   SET media_url = COALESCE(media_url, image_url),
       media_kind = CASE
         WHEN COALESCE(media_url, image_url) ILIKE '%.gif' THEN 'gif'
         WHEN COALESCE(media_url, image_url) ILIKE '%.mp4' THEN 'video'
         WHEN COALESCE(media_url, image_url) IS NULL THEN 'none'
         ELSE 'image'
       END
 WHERE media_url IS NULL;

-- DONATIONS
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS source  text    NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS visible boolean NOT NULL DEFAULT true;
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_source_check;
ALTER TABLE public.donations ADD CONSTRAINT donations_source_check CHECK (source IN ('admin','public'));
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS donations_amount_sane;
ALTER TABLE public.donations ADD CONSTRAINT donations_amount_sane CHECK (amount >= 0 AND amount <= 1000000000);
DROP POLICY IF EXISTS "donations_public_read" ON public.donations;
CREATE POLICY "donations_public_read" ON public.donations FOR SELECT TO anon, authenticated USING (visible = true);

-- FLOATERS
ALTER TABLE public.floaters DROP CONSTRAINT IF EXISTS floaters_kind_check;
ALTER TABLE public.floaters ADD CONSTRAINT floaters_kind_check CHECK (kind IN ('emoji','meme','gif','sticker'));

-- SITE SETTINGS
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_lines       jsonb   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS thanks_lines     jsonb   NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS marquee_text     text    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS donate_note      text    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS public_donations boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sound_enabled    boolean NOT NULL DEFAULT true;

UPDATE public.site_settings SET
  hero_lines = CASE WHEN hero_lines = '[]'::jsonb THEN '[
    "Tilanchi bu — shunchaki kasb emas, bu san''at! 🎨",
    "Siz bergan 1000 so''m — bizning VIP kelajagimiz. 💎",
    "Biz so''ramaymiz, biz taklif qilamiz: hamkorlik 🤝",
    "Karta raqamimiz olmos bilan qoplangan, ehtiyot bo''ling! 💳",
    "Metroda emas, Mars orbitasida so''raymiz. 🚀",
    "Bizda qo''l cho''zish 4K 120fps sifatida uzatiladi. 📡"
  ]'::jsonb ELSE hero_lines END,
  thanks_lines = CASE WHEN thanks_lines = '[]'::jsonb THEN '[
    "Siz rasman VIP saxiysiz! 👑",
    "Koinot sizga qaytaradi (ehtimol) ✨",
    "Bosh tilanchimiz sizga ta''zim qilmoqda 🙇",
    "Ismingiz oltin ro''yxatga yozildi 📜",
    "Bu pul to''g''ridan-to''g''ri oltin kartonga sarflanadi 🪙",
    "Ehsoningiz 3 daqiqada Marsga yetib boradi 🛸"
  ]'::jsonb ELSE thanks_lines END,
  marquee_text = CASE WHEN marquee_text = '' THEN
    'VIP TILANCHILIK KLUBI • OLTIN DARAJA • 24/7 QO''L CHO''ZAMIZ • KOSMIK DONAT • SOQQA YO''Q, KAYFIYAT BOR • ANIMATSIYA UCHUN NON YEMADIK'
    ELSE marquee_text END,
  donate_note = CASE WHEN donate_note = '' THEN
    'Bu sayt yumor uchun. Pul so''ralmaydi, olinmaydi, qaytarilmaydi. 😄'
    ELSE donate_note END
WHERE id = 1;

CREATE INDEX IF NOT EXISTS posts_created_at_idx     ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_pinned_idx         ON public.posts (pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS comments_post_id_idx     ON public.comments (post_id, created_at);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON public.donations (created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx   ON public.reviews (created_at DESC);

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.posts; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.comments; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.donations; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.floaters; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$;

INSERT INTO public.posts (title, body, badge, animation, media_kind, sticker, likes, views) VALUES
('Tilanchilik 2.0: endi QR kod ham oltin ramkada 🪙',
 'Yangi avlod QR kodimiz shunchalik chiroyliki, odamlar pul bermasa ham skanerlab tomosha qilib ketmoqda. Marketing bo''limi bu holatni "estetik ehson" deb nomladi.',
 '🪙 TEXNOLOGIYA', 'flip', 'none', 'coin', 742, 2410),
('Bosh tilanchimiz VIP kartonga ko''chdi 🏠',
 'Eski kartonimiz 3 yil xizmat qildi. Yangi uy-joy: 2 xonali, panoramali, shamollatish tizimi tabiiy. Dizayner italyan emas, lekin mahallada eng zo''r.',
 '🏠 KO''CHISH MAROSIMI', 'slide', 'none', 'money', 1188, 4600),
('Statistika: donat tugmasi 47 000 marta bosilgan, pul — 0 so''m 📊',
 'Tahlilchilar aniqladi: foydalanuvchilar konfetti animatsiyasini ko''rish uchun tugmani bosaveradi. Biz xafa emasmiz — animatsiya ham qiymat.',
 '📊 TAHLIL', 'glitch', 'none', 'rocket', 2310, 8800)
ON CONFLICT DO NOTHING;

INSERT INTO public.reviews (name, role, avatar, body) VALUES
('Anonim Boss', 'Kartasi bor odam', '🎩', 'Pul bermadim, faqat scroll animatsiyasini 40 daqiqa tomosha qildim. Shunisi ham ehson hisoblanadi deyishdi.'),
('Prof. Soqqayev', 'Tilanchilik fanlari doktori', '🎓', 'Dizayn shunchalik ilmiy asoslangan-ki, dissertatsiyamni qayta yozishga to''g''ri keldi.'),
('Gulnora opa', 'Qo''shni podyezd', '🧕', 'Bolam, sayting chiroyli, lekin non olib kelsang bo''lardi.')
ON CONFLICT DO NOTHING;

INSERT INTO public.floaters (content, kind) VALUES
('Aka, 2000 so''m berib turing — kosmosga chiqamiz 🚀', 'meme'),
('Donat qilsang — VIP, qilmasang ham mehmon 😌', 'meme'),
('Bizda kesh yo''q, faqat keshbek 😎', 'meme'),
('Oltin karta faqat bugun (har kuni bugun) 🪙', 'meme'),
('coin', 'sticker'), ('money', 'sticker'), ('rocket', 'sticker'), ('crown', 'sticker'), ('hand', 'sticker'),
('🤲', 'emoji'), ('🪙', 'emoji'), ('🌌', 'emoji'), ('😇', 'emoji'), ('🎩', 'emoji')
ON CONFLICT DO NOTHING;

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

REVOKE ALL ON FUNCTION public.increment_total_amount(bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_total_amount(bigint) TO service_role;