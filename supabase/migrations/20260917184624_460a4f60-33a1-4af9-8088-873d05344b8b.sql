CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text,
  badge text NOT NULL DEFAULT '🔥 RASMIY E''LON',
  animation text NOT NULL DEFAULT 'zoom',
  likes integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_public_read" ON public.posts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author text NOT NULL DEFAULT 'Admin',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_public_read" ON public.comments FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'VIP Donater',
  avatar text NOT NULL DEFAULT '👑',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Anonim VIP',
  amount bigint NOT NULL DEFAULT 0,
  message text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.donations TO anon, authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donations_public_read" ON public.donations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.floaters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  kind text NOT NULL DEFAULT 'emoji',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.floaters TO anon, authenticated;
GRANT ALL ON public.floaters TO service_role;
ALTER TABLE public.floaters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "floaters_public_read" ON public.floaters FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  total_amount bigint NOT NULL DEFAULT 12450000,
  card_number text NOT NULL DEFAULT '9860 1766 1972 7397',
  card_holder text NOT NULL DEFAULT 'TILANCHILIK.UZ VIP',
  floater_interval_sec integer NOT NULL DEFAULT 60,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_settings_public_read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.site_settings (id) VALUES (1);

INSERT INTO public.posts (title, body, image_url, badge, animation, likes, views) VALUES
('Yangi Pro Max Tilanchilik Texnologiyasi taqdim etildi', 'Endi metroda "Aka 2000 so''m berib turing" deyish shart emas! Saytimiz orqali bir bosishda donat qiling. Olmos bilan qoplangan karta raqamimiz tayyor.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', '🔥 RASMIY E''LON', 'zoom', 1240, 5400),
('Tilanchilar Assotsiatsiyasi kosmosga chiqdi 🚀', 'Bugun ertalab bizning bosh tilanchimiz Mars orbitasidan birinchi VIP donat so''rovini yubordi. Aloqa a''lo, soqqa yo''q.', 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=1200&q=80', '🛸 KOSMIK XABAR', 'slide', 860, 3120),
('Oltin reyting: eng saxiy 3 donater e''lon qilindi', 'Birinchi o''rin — 1,000,000 so''m. Ikkinchi o''rin — 500,000 so''m. Uchinchi o''rin — "keyin beraman" deb yozgan aka.', 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=1200&q=80', '👑 VIP REYTING', 'flip', 431, 1890);

INSERT INTO public.comments (post_id, author, body)
SELECT id, 'Admin', 'Izohlar faqat admin tomonidan yoziladi. Siz esa faqat donat qilishingiz mumkin 😎' FROM public.posts;

INSERT INTO public.reviews (name, role, avatar, body) VALUES
('Ilhomjon VIP', 'Professional Donater', '👨‍💼', 'Saytga tasodifan kirib qolib 10,000 so''m berib yubordim. Dizayni shunchalik lyuks-ki, endi har kuni xotinimdan berkitib donat qilyapman!'),
('Elon Musk (Soxta)', 'SpaceX Assistent', '🚀', 'Marsga uchishdan oldin oxirgi pullarimni shu saytga berib yubordim. Kosmik scroll animatsiyasiga gap yo''q!'),
('Sardor Bro', 'Toshkent Sity VIP', '👑', 'Avvallari ko''chada yurardim, endi mana tilanchilik.uz da soqqa qilyapman. Barchaga tavsiya qilaman!');

INSERT INTO public.donations (name, amount, message) VALUES
('Anonim VIP', 1000000, 'Bu pulni topganimni hech kimga aytmanglar 🤫'),
('Bahodir aka', 50000, 'Choyga qo''shib yuboring'),
('Kamola opa', 20000, 'Dizayn uchun, tilanchilik uchun emas 😂');

INSERT INTO public.floaters (content, kind) VALUES
('💸', 'emoji'), ('👑', 'emoji'), ('🤑', 'emoji'), ('🚀', 'emoji'), ('💎', 'emoji'),
('Aka 1000 so''m bervoring!', 'meme'),
('Karta raqam yodda: 9860...', 'meme'),
('VIP tilanchi onlayn 🟢', 'meme');