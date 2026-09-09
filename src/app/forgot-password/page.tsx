import Link from 'next/link'
import { AuthFrame } from '@/components/auth-frame'
import { resetPassword } from './actions'
export default async function Forgot({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){const q=await searchParams;return <AuthFrame title="Parolni tiklash" subtitle="Emailingizni kiriting. Sizga tiklash havolasini yuboramiz." footer={<Link href="/login">← Kirishga qaytish</Link>}><form action={resetPassword} className="auth-form"><label><span>Email</span><input name="email" type="email" required placeholder="siz@email.uz"/></label>{q.error&&<div className="alert alert-danger">{q.error}</div>}<button className="btn primary full">Tiklash havolasini yuborish</button></form></AuthFrame>}
