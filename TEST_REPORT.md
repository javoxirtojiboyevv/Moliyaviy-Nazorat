# Qarz Nazorati Web — Test Report

Date: 2026-09-09

## Automated finance tests
Command:
```bash
node --experimental-strip-types --test tests/*.test.ts
```
Result: **7/7 passed**.

Covered:
- formatted money parsing
- salary + monthly extra income
- remaining debt from unpaid installments
- progress including down payment
- current commitment including overdue debt
- installment amounts sum exactly to financed amount
- due day 31 clamps to February last day

## Structural / security verification
Command:
```bash
python3 tool/verify_project.py
```
Result: **69/69 passed**.

Covered:
- required routes/files
- local import resolution
- no service-role key in runtime source
- no hardcoded Supabase project URL
- publishable key env configuration
- current @supabase/ssr architecture
- protected route proxy using verified claims
- profiles/incomes/debts/payments schema
- RLS enabled on every business table
- create/update debt transaction RPCs
- auth profile trigger
- anon RPC execution revoked
- private authenticated pages excluded from PWA cache
- Next.js 16 / React 19 baseline

## TypeScript parse check
The global TypeScript compiler was run without installed project dependencies. It reported **no TS1xxx parser/syntax diagnostics**. Expected missing-package/JSX-type diagnostics remain because npm registry access is not available in this execution environment.

## Environment limitation
This environment could not reach npm registry reliably, so `npm install`, full `next build`, and live Supabase integration could not be executed here. Run the following after connecting your Supabase project:
```bash
npm install
npm run test
npm run typecheck
npm run build
```
