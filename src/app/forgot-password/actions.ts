'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'
export async function resetPassword(formData:FormData){const email=String(formData.get('email')||'').trim();if(!email.includes('@'))redirect('/forgot-password?error=Email%20noto‘g‘ri');const supabase=await createClient();const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${getSiteUrl()}/auth/callback?next=/update-password`});if(error)redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);redirect('/login?message=Parolni%20tiklash%20havolasi%20emailga%20yuborildi')}
