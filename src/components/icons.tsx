import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
export function HomeIcon(p:P){return <svg {...base} {...p}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>}
export function DebtIcon(p:P){return <svg {...base} {...p}><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>}
export function WalletIcon(p:P){return <svg {...base} {...p}><path d="M4 7a3 3 0 0 1 3-3h11v4H7a3 3 0 0 0 0 6h13v6H7a3 3 0 0 1-3-3Z"/><path d="M16 11h4v6h-4a3 3 0 1 1 0-6Z"/></svg>}
export function ChartIcon(p:P){return <svg {...base} {...p}><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>}
export function SettingsIcon(p:P){return <svg {...base} {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>}
export function PlusIcon(p:P){return <svg {...base} {...p}><path d="M12 5v14M5 12h14"/></svg>}
export function BellIcon(p:P){return <svg {...base} {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>}
export function CheckIcon(p:P){return <svg {...base} {...p}><path d="m5 12 4 4L19 6"/></svg>}
export function TrashIcon(p:P){return <svg {...base} {...p}><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>}
export function EditIcon(p:P){return <svg {...base} {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>}
export function LogoutIcon(p:P){return <svg {...base} {...p}><path d="M10 17l5-5-5-5M15 12H3M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>}
export function ChevronIcon(p:P){return <svg {...base} {...p}><path d="m9 18 6-6-6-6"/></svg>}
