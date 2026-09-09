'use client'

import { useCallback, useEffect, useState } from 'react'
import { loadFinanceData } from '@/lib/finance-service'
import type { Debt, Income, Profile } from '@/types/database'

export function useFinanceData() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [incomes, setIncomes] = useState<Income[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      const data = await loadFinanceData()
      setProfile(data.profile)
      setIncomes(data.incomes)
      setDebts(data.debts)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ma’lumotlarni yuklashda xatolik yuz berdi.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  return { profile, incomes, debts, loading, error, refresh }
}
