# Architecture

```text
Browser / PWA
    │
    ├─ Next.js 16 App Router + React 19
    │   ├─ Public landing
    │   ├─ Auth pages
    │   └─ Protected finance UI
    │
    ├─ @supabase/ssr
    │   └─ cookie-based auth / proxy session refresh
    │
    └─ Supabase
        ├─ Auth (users/sessions/email confirmation)
        └─ PostgreSQL
            ├─ profiles
            ├─ incomes
            ├─ debts
            └─ payments
```

## Security boundary
Frontend faqat Supabase `publishable key` ishlatadi. Ma'lumotga kirishni PostgreSQL RLS hal qiladi. Qarz jadvalini yaratish/tahrirlash RPC orqali transaction ichida payment schedule bilan birga bajariladi.

## Financial rule parity with mobile
- Monthly income = base salary + incomes dated in selected month.
- Current commitment = payments scheduled in selected month + all older unpaid payments.
- Net planned cash = income - commitment.
- Debt paid total = down payment + paid installments.
- Remaining debt = sum of unpaid installment rows.
- Progress = paid total / original total amount.
