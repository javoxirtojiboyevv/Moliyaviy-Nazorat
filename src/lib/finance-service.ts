import { createClient } from '@/lib/supabase/client'
import type { Debt, DebtInput, Income, IncomeType, Profile } from '@/types/database'

function client() { return createClient() }

export async function loadFinanceData() {
  const supabase = client()
  const [profileResult, incomesResult, debtsResult] = await Promise.all([
    supabase.from('profiles').select('*').single(),
    supabase.from('incomes').select('*').order('income_date', { ascending: false }),
    supabase.from('debts').select('*, payments(*)').order('created_at', { ascending: false }),
  ])
  if (profileResult.error) throw profileResult.error
  if (incomesResult.error) throw incomesResult.error
  if (debtsResult.error) throw debtsResult.error

  const debts = (debtsResult.data ?? []).map((debt: any) => ({
    ...debt,
    payments: [...(debt.payments ?? [])].sort((a: any, b: any) => a.sequence - b.sequence),
  })) as Debt[]

  return {
    profile: profileResult.data as Profile,
    incomes: (incomesResult.data ?? []) as Income[],
    debts,
  }
}

export async function updateProfile(patch: Partial<Pick<Profile, 'full_name' | 'monthly_salary' | 'currency' | 'reminder_enabled' | 'reminder_days_before' | 'reminder_hour' | 'timezone'>>) {
  const supabase = client()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Foydalanuvchi sessiyasi topilmadi.')
  const { error } = await supabase.from('profiles').update(patch).eq('id', auth.user.id)
  if (error) throw error
}

export async function addIncome(input: { title: string; type: IncomeType; amount: number; incomeDate: string; note?: string }) {
  const supabase = client()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('Foydalanuvchi sessiyasi topilmadi.')
  const { error } = await supabase.from('incomes').insert({
    user_id: auth.user.id,
    title: input.title,
    type: input.type,
    amount: input.amount,
    income_date: input.incomeDate,
    note: input.note || null,
  })
  if (error) throw error
}

export async function updateIncome(id: string, input: { title: string; type: IncomeType; amount: number; incomeDate: string; note?: string }) {
  const { error } = await client().from('incomes').update({
    title: input.title,
    type: input.type,
    amount: input.amount,
    income_date: input.incomeDate,
    note: input.note || null,
  }).eq('id', id)
  if (error) throw error
}

export async function deleteIncome(id: string) {
  const { error } = await client().from('incomes').delete().eq('id', id)
  if (error) throw error
}

export async function createDebt(input: DebtInput) {
  const { data, error } = await client().rpc('create_debt', {
    p_name: input.name,
    p_creditor: input.creditor,
    p_total_amount: input.totalAmount,
    p_down_payment: input.downPayment,
    p_total_months: input.totalMonths,
    p_start_date: input.startDate,
    p_due_day: input.dueDay,
    p_note: input.note || null,
    p_reminder_enabled: input.reminderEnabled,
  })
  if (error) throw error
  return data as string
}

export async function updateDebt(id: string, input: DebtInput) {
  const { error } = await client().rpc('update_debt', {
    p_debt_id: id,
    p_name: input.name,
    p_creditor: input.creditor,
    p_total_amount: input.totalAmount,
    p_down_payment: input.downPayment,
    p_total_months: input.totalMonths,
    p_start_date: input.startDate,
    p_due_day: input.dueDay,
    p_note: input.note || null,
    p_reminder_enabled: input.reminderEnabled,
  })
  if (error) throw error
}

export async function deleteDebt(id: string) {
  const { error } = await client().from('debts').delete().eq('id', id)
  if (error) throw error
}

export async function setPaymentPaid(id: string, paid: boolean) {
  const { error } = await client().from('payments').update({ paid_at: paid ? new Date().toISOString() : null }).eq('id', id)
  if (error) throw error
}
