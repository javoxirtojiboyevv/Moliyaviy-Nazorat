'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChartIcon, DebtIcon, HomeIcon, LogoutIcon, PlusIcon, SettingsIcon, WalletIcon } from '@/components/icons'

const items = [
  { href: '/dashboard', label: 'Asosiy', icon: HomeIcon },
  { href: '/incomes', label: 'Daromad', icon: WalletIcon },
  { href: '/debts', label: 'Qarzlar', icon: DebtIcon },
  { href: '/payments', label: 'To‘lovlar', icon: PlusIcon },
  { href: '/analytics', label: 'Tahlil', icon: ChartIcon },
  { href: '/settings', label: 'Sozlamalar', icon: SettingsIcon },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(), router = useRouter()
  async function logout(){await createClient().auth.signOut();router.replace('/login');router.refresh()}
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand"><span className="brand-mark">QN</span><span><b>Qarz Nazorati</b><small>Moliyaviy boshqaruv</small></span></Link>
      <nav>{items.map(({href,label,icon:Icon})=><Link key={href} href={href} className={pathname.startsWith(href)?'active':''}><Icon/><span>{label}</span></Link>)}</nav>
      <button className="sidebar-logout" onClick={logout}><LogoutIcon/>Chiqish</button>
    </aside>
    <main className="app-main">{children}</main>
    <nav className="bottom-nav">{items.slice(0,5).map(({href,label,icon:Icon})=><Link key={href} href={href} className={pathname.startsWith(href)?'active':''}><Icon/><small>{label}</small></Link>)}</nav>
  </div>
}
