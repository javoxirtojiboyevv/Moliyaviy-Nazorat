'use client'

import { formatMoney } from '@/lib/finance'

export function ProgressRing({ value, size = 150, label = 'to‘langan' }: { value: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(1, value))
  const radius = 54, c = 2 * Math.PI * radius
  return <svg width={size} height={size} viewBox="0 0 140 140" className="progress-ring" aria-label={`${Math.round(pct*100)} foiz ${label}`}>
    <circle cx="70" cy="70" r={radius} className="ring-bg"/>
    <circle cx="70" cy="70" r={radius} className="ring-value" strokeDasharray={c} strokeDashoffset={c*(1-pct)}/>
    <text x="70" y="67" textAnchor="middle" className="ring-number">{Math.round(pct*100)}%</text>
    <text x="70" y="87" textAnchor="middle" className="ring-label">{label}</text>
  </svg>
}

export function BudgetSplit({ income, debt }: { income: number; debt: number }) {
  const safeIncome = Math.max(0, income), safeDebt = Math.max(0, debt)
  const debtPct = safeIncome > 0 ? Math.min(1, safeDebt / safeIncome) : safeDebt > 0 ? 1 : 0
  const net = safeIncome - safeDebt
  return <div className="budget-split">
    <div className="budget-row"><div><span>Qarzga</span><strong>{formatMoney(safeDebt)}</strong></div><b>{Math.round(debtPct*100)}%</b></div>
    <div className="bar"><i style={{ width: `${debtPct*100}%` }}/></div>
    <div className="budget-row net"><div><span>Sof qoladi</span><strong>{formatMoney(net)}</strong></div><b>{safeIncome ? Math.round((net/safeIncome)*100) : 0}%</b></div>
  </div>
}

export function TrendChart({ points }: { points: { label: string; income: number; debt: number }[] }) {
  const W=620,H=230,P=34
  const max = Math.max(1, ...points.flatMap(p => [p.income,p.debt]))
  const x=(i:number)=> P + i*((W-2*P)/Math.max(1,points.length-1))
  const y=(v:number)=> H-P-(v/max)*(H-2*P)
  const path=(key:'income'|'debt')=>points.map((p,i)=>`${i?'L':'M'} ${x(i)} ${y(p[key])}`).join(' ')
  return <div className="trend-wrap"><svg viewBox={`0 0 ${W} ${H}`} className="trend-chart" role="img" aria-label="Olti oylik daromad va qarz grafigi">
    {[0,.25,.5,.75,1].map(t=><line key={t} x1={P} x2={W-P} y1={y(max*t)} y2={y(max*t)} className="grid-line"/>) }
    <path d={path('income')} className="line income-line"/><path d={path('debt')} className="line debt-line"/>
    {points.map((p,i)=><g key={p.label}><circle cx={x(i)} cy={y(p.income)} r="4" className="dot income-dot"/><circle cx={x(i)} cy={y(p.debt)} r="4" className="dot debt-dot"/><text x={x(i)} y={H-8} textAnchor="middle" className="axis-label">{p.label.split(' ')[0]}</text></g>)}
  </svg><div className="legend"><span><i className="income-key"/>Daromad</span><span><i className="debt-key"/>Qarz to‘lovlari</span></div></div>
}
