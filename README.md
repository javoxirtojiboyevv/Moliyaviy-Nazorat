# Qarz Nazorati — Web / PWA

Mobil **Qarz Nazorati** ilovasining real web-versiyasi. Next.js + TypeScript + Supabase PostgreSQL/Auth asosida yozilgan.

## Ishlaydigan funksiyalar
- Email/parol bilan ro‘yxatdan o‘tish va login
- Email tasdiqlash, logout, parolni tiklash
- Har foydalanuvchi uchun alohida profil (RLS bilan himoyalangan)
- Bazaviy oylik maosh
- Bonus / qo‘shimcha maosh / freelance / boshqa tushumlar
- Oylar bo‘yicha jami daromad
- Cheklanmagan qarz / bo‘lib to‘lash
- Boshlang‘ich to‘lov, jami oy, to‘lov kuni
- Aniq oyma-oy to‘lov jadvali (oxirgi oy qoldiqqa mos)
- 31-sana qisqa oyda avtomatik oxirgi kunga tushadi
- To‘lovni `To‘landi ✓` qilish va bekor qilish
- To‘langan summa, qolgan qarz, qolgan oy, progress
- Eski kechikkan qarzni joriy oy majburiyatiga qo‘shish
- Daromad − majburiyat = sof qoldiq
- To‘langan/qolgan progress grafigi
- Daromad/qarz byudjet grafigi
- 6 oylik dinamika grafigi
- To‘lovlar kalendari
- Responsive iOS/PWA dizayn
- PWA service worker va Home Screen manifest

## 1. Supabase
1. https://supabase.com da loyiha yarating.
2. SQL Editor'ga `supabase/schema.sql` faylining to‘liq mazmunini qo‘yib **Run** bosing.
3. Project Connect oynasidan `Project URL` va `Publishable key` oling.

## 2. Environment
```bash
cp .env.example .env.local
```
`.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Auth URL
Supabase → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/**`

Production'da Vercel domenini ham qo‘shing.

## 4. Ishga tushirish
```bash
npm install
npm run test
npm run typecheck
npm run dev
```
Brauzer: http://localhost:3000

## Production
Vercel'ga repository'ni ulang, yuqoridagi 3 environment variable'ni Vercel Project Settings → Environment Variables bo‘limiga kiriting. `NEXT_PUBLIC_SITE_URL` qiymatini production domeniga almashtiring.

## Xavfsizlik
`schema.sql` barcha biznes jadvallarida Row Level Security (RLS) yoqadi. Har bir row `auth.uid()` bilan tekshiriladi. `service_role` key frontendda ishlatilmaydi va source code'ga kiritilmasligi kerak.

## Web Push haqida
Hozirgi versiyada yaqin muddat/kechikishlar tizim ichida real vaqt ma'lumotlari asosida ko‘rsatiladi. Brauzer yopiq paytda keladigan **Web Push** uchun keyingi production bosqichida Push Subscription + VAPID + Supabase Edge Function/Cron ulash kerak. Interfeys buni yolg‘on “fon notification” sifatida ko‘rsatmaydi.
