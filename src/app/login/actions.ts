'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email=String(formData.get('email')||'').trim(), password=String(formData.get('password')||'')
  const next=String(formData.get('next')||'/dashboard')
  if(!email||!password) redirect('/login?error=Email%20va%20parolni%20kiriting')
  const supabase=await createClient(); const {error}=await supabase.auth.signInWithPassword({email,password})
  if(error) redirect(`/login?error=${encodeURIComponent('Email yoki parol noto‘g‘ri.')}`)
  redirect(next.startsWith('/')?next:'/dashboard')
}
