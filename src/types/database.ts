export type IncomeType = 'salary_extra' | 'bonus' | 'freelance' | 'other'

export interface Profile {
  id: string
  full_name: string
  currency: string
  monthly_salary: number
  reminder_enabled: boolean
  reminder_days_before: number
  reminder_hour: number
  timezone: string
  created_at: string
  updated_at: string
}

export interface Income {
  id: string
  user_id: string
  title: string
  type: IncomeType
  amount: number
  income_date: string
  note: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  debt_id: string
  sequence: number
  amount: number
  due_date: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface Debt {
  id: string
  user_id: string
  name: string
  creditor: string
  total_amount: number
  down_payment: number
  total_months: number
  start_date: string
  due_day: number
  note: string | null
  reminder_enabled: boolean
  status: 'active' | 'completed'
  created_at: string
  updated_at: string
  payments: Payment[]
}

export interface DebtInput {
  name: string
  creditor: string
  totalAmount: number
  downPayment: number
  totalMonths: number
  startDate: string
  dueDay: number
  note: string
  reminderEnabled: boolean
}
