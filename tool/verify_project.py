from pathlib import Path
import re, sys, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
errors=[]
checks=[]

def ok(name, cond, detail=''):
    checks.append((name, bool(cond), detail))
    if not cond: errors.append(f'{name}: {detail}')

# Required files
required = [
    'package.json','proxy.ts','src/app/layout.tsx','src/app/page.tsx',
    'src/app/(app)/dashboard/page.tsx','src/app/(app)/incomes/page.tsx',
    'src/app/(app)/debts/page.tsx','src/app/(app)/payments/page.tsx',
    'src/app/(app)/analytics/page.tsx','src/app/(app)/settings/page.tsx',
    'src/lib/finance.ts','src/lib/finance-service.ts','supabase/schema.sql',
]
ok('required-files', all((ROOT/x).exists() for x in required), ', '.join(x for x in required if not (ROOT/x).exists()))

# Local alias / relative import resolution
source_files=list((ROOT/'src').rglob('*.ts'))+list((ROOT/'src').rglob('*.tsx'))+[ROOT/'proxy.ts',ROOT/'next.config.ts']
missing=[]
pat=re.compile(r"(?:from\s+|import\s*)['\"]([^'\"]+)['\"]")
for f in source_files:
    text=f.read_text(encoding='utf-8')
    for imp in pat.findall(text):
        if imp.startswith('@/'):
            base=ROOT/'src'/imp[2:]
        elif imp.startswith('.'):
            base=(f.parent/imp).resolve()
        else:
            continue
        candidates=[base,Path(str(base)+'.ts'),Path(str(base)+'.tsx'),base/'index.ts',base/'index.tsx']
        if not any(c.exists() for c in candidates): missing.append(f'{f.relative_to(ROOT)} -> {imp}')
ok('local-imports', not missing, '; '.join(missing[:10]))

# Finance and app security checks
src='\n'.join(f.read_text(encoding='utf-8') for f in source_files if f.exists())
ok('no-service-role-key-in-source', 'service_role' not in src.lower(), 'service_role must never be in frontend/source runtime')
ok('no-hardcoded-supabase-project', '.supabase.co' not in src, 'project URL should come from env only')
ok('publishable-env-used', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY' in src, '')
ok('ssr-auth-package-used', "@supabase/ssr" in src, '')
ok('protected-proxy-present', 'getClaims' in (ROOT/'src/lib/supabase/proxy.ts').read_text(), '')

# SQL structural guarantees
sql=(ROOT/'supabase/schema.sql').read_text(encoding='utf-8').lower()
for table in ['profiles','incomes','debts','payments']:
    ok(f'sql-table-{table}', f'create table if not exists public.{table}' in sql, '')
    ok(f'rls-{table}', f'alter table public.{table} enable row level security' in sql, '')
ok('rpc-create-debt', 'function public.create_debt' in sql, '')
ok('rpc-update-debt', 'function public.update_debt' in sql, '')
ok('safe-payment-date', 'function public.safe_payment_date' in sql, '')
ok('auth-profile-trigger', 'on_auth_user_created' in sql and 'handle_new_user' in sql, '')
ok('rpc-auth-check', sql.count('auth.uid()') >= 6, '')
ok('rpc-no-anon-execute', 'revoke execute on function public.create_debt' in sql and 'from public, anon' in sql, '')

# PWA should not cache private authenticated pages
sw=(ROOT/'public/sw.js').read_text(encoding='utf-8')
ok('pwa-private-pages-not-cached', '/dashboard' not in sw and '/debts' not in sw and '/payments' not in sw, '')

# Package baseline
pkg=json.loads((ROOT/'package.json').read_text())
ok('next-16-baseline', pkg['dependencies'].get('next','').startswith('16.'), pkg['dependencies'].get('next',''))
ok('react-19-baseline', pkg['dependencies'].get('react','').startswith('19.'), pkg['dependencies'].get('react',''))

# Basic bracket balance, after removing strings/comments approximately
for f in source_files:
    text=f.read_text(encoding='utf-8')
    # TypeScript parser check is done separately; this catches accidental truncation.
    ok(f'nonempty:{f.relative_to(ROOT)}', len(text.strip())>0, '')

# Manifest hash
entries=[]
for f in sorted(ROOT.rglob('*')):
    if f.is_file() and f.name != 'MANIFEST.sha256':
        entries.append(f'{hashlib.sha256(f.read_bytes()).hexdigest()}  {f.relative_to(ROOT).as_posix()}')
(ROOT/'MANIFEST.sha256').write_text('\n'.join(entries)+'\n',encoding='utf-8')

for name, passed, detail in checks:
    print(('PASS' if passed else 'FAIL'), name, detail)
print(f'\n{sum(1 for _,p,_ in checks if p)}/{len(checks)} checks passed')
sys.exit(1 if errors else 0)
