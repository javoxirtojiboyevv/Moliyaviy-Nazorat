'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'

export async function register(formData: FormData) {
  const fullName=String(formData.get('fullName')||'').trim(), email=String(formData.get('email')||'').trim(), password=String(formData.get('password')||''), confirm=String(formData.get('confirm')||'')
  if(fullName.length<2) redirect('/register?error=Ismni%20to‘liq%20kiriting')
  if(!email.includes('@')) redirect('/register?error=Email%20noto‘g‘ri')
  if(password.length<8) redirect('/register?error=Parol%20kamida%208%20belgi%20bo‘lsin')
  if(password!==confirm) redirect('/register?error=Parollar%20mos%20emas')
  const supabase=await createClient(); const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:fullName},emailRedirectTo:`${getSiteUrl()}/auth/callback?next=/dashboard`}})
  if(error) redirect(`/register?error=${encodeURIComponent(error.message)}`)
  if(data.session) redirect('/dashboard')
  redirect('/login?message=Emailingizga%20tasdiqlash%20havolasi%20yuborildi')
}
