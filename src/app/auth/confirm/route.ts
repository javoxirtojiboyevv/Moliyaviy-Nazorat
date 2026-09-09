import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(request:NextRequest){const token_hash=request.nextUrl.searchParams.get('token_hash'), type=request.nextUrl.searchParams.get('type') as EmailOtpType|null, next=request.nextUrl.searchParams.get('next')||'/dashboard';const target=request.nextUrl.clone();if(token_hash&&type){const supabase=await createClient();const {error}=await supabase.auth.verifyOtp({type,token_hash});if(!error){target.pathname=next.startsWith('/')?next:'/dashboard';target.search='';return NextResponse.redirect(target)}}target.pathname='/login';target.search='?error=Email%20tasdiqlanmadi';return NextResponse.redirect(target)}
