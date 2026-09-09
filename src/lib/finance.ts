import type { Debt, Income, Payment } from '@/types/database'

export const UZS = new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 0 })

export function formatMoney(value: number, currency = 'so‘m') {
  const safe = Number.isFinite(value) ? Math.trunc(value) : 0
  return `${UZS.format(safe)} ${currency}`
}

export function parseMoney(value: string | number) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
  const digits = value.replace(/[^0-9]/g, '')
  return digits ? Number.parseInt(digits, 10) : 0
}

export function isoDate(value: Date) {
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function localDate(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function monthStart(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

export function monthEnd(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0, 23, 59, 59, 999)
}

export function sameMonth(dateIso: string, month: Date) {
  const d = localDate(dateIso)
  return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth()
}

export function addMonths(value: Date, months: number) {
  return new Date(value.getFullYear(), value.getMonth() + months, 1)
}

export function monthLabel(value: Date) {
  const names = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
  return `${names[value.getMonth()]} ${value.getFullYear()}`
}

export function fullMonthLabel(value: Date) {
  const names = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
  return `${names[value.getMonth()]} ${value.getFullYear()}`
}

export function allPayments(debts: Debt[]) {
  return debts.flatMap((debt) => debt.payments.map((payment) => ({ ...payment, debt })))
}

export function paymentsForMonth(debts: Debt[], month: Date) {
  return allPayments(debts).filter((item) => sameMonth(item.due_date, month)).sort((a, b) => a.due_date.localeCompare(b.due_date))
}

export function incomeForMonth(monthlySalary: number, incomes: Income[], month: Date) {
  return Math.max(0, monthlySalary) + incomes.filter((income) => sameMonth(income.income_date, month)).reduce((sum, income) => sum + income.amount, 0)
}

export function scheduledForMonth(debts: Debt[], month: Date) {
  return paymentsForMonth(debts, month).reduce((sum, payment) => sum + payment.amount, 0)
}

export function paidForMonth(debts: Debt[], month: Date) {
  return paymentsForMonth(debts, month).filter((payment) => Boolean(payment.paid_at)).reduce((sum, payment) => sum + payment.amount, 0)
}

export function overdueUnpaidBeforeMonth(debts: Debt[], month: Date) {
  const start = monthStart(month)
  return allPayments(debts)
    .filter((payment) => !payment.paid_at && localDate(payment.due_date) < start)
    .reduce((sum, payment) => sum + payment.amount, 0)
}

export function commitmentForMonth(debts: Debt[], month: Date) {
  return scheduledForMonth(debts, month) + overdueUnpaidBeforeMonth(debts, month)
}

export function paidInstallments(debt: Debt) {
  return debt.payments.filter((p) => p.paid_at).reduce((sum, p) => sum + p.amount, 0)
}

export function debtPaidTotal(debt: Debt) {
  return Math.min(debt.total_amount, debt.down_payment + paidInstallments(debt))
}

export function debtRemaining(debt: Debt) {
  return debt.payments.filter((p) => !p.paid_at).reduce((sum, p) => sum + p.amount, 0)
}

export function debtProgress(debt: Debt) {
  return debt.total_amount <= 0 ? 0 : debtPaidTotal(debt) / debt.total_amount
}

export function totalOriginal(debts: Debt[]) {
  return debts.reduce((sum, debt) => sum + debt.total_amount, 0)
}

export function totalPaid(debts: Debt[]) {
  return debts.reduce((sum, debt) => sum + debtPaidTotal(debt), 0)
}

export function totalRemaining(debts: Debt[]) {
  return debts.reduce((sum, debt) => sum + debtRemaining(debt), 0)
}

export function overallProgress(debts: Debt[]) {
  const total = totalOriginal(debts)
  return total <= 0 ? 0 : totalPaid(debts) / total
}

export function debtLoadRatio(income: number, commitment: number) {
  if (income <= 0) return commitment > 0 ? 1 : 0
  return commitment / income
}

export function nextUnpaidPayment(debt: Debt): Payment | undefined {
  return [...debt.payments].filter((p) => !p.paid_at).sort((a, b) => a.due_date.localeCompare(b.due_date))[0]
}

export function paymentStatus(payment: Payment, today = new Date()) {
  if (payment.paid_at) return 'paid' as const
  const due = localDate(payment.due_date)
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (due < t) return 'overdue' as const
  if (due.getTime() === t.getTime()) return 'today' as const
  const diff = Math.ceil((due.getTime() - t.getTime()) / 86400000)
  if (diff === 1) return 'tomorrow' as const
  return 'upcoming' as const
}

export function sixMonthSeries(monthlySalary: number, incomes: Income[], debts: Debt[], reference = new Date()) {
  return Array.from({ length: 6 }, (_, index) => addMonths(monthStart(reference), index - 5)).map((month) => ({
    month,
    label: monthLabel(month),
    income: incomeForMonth(monthlySalary, incomes, month),
    debt: scheduledForMonth(debts, month),
  }))
}
