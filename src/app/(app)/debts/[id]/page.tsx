import { DebtDetailClient } from '@/components/debt-detail-client'
export default async function DebtDetail({params}:{params:Promise<{id:string}>}){const {id}=await params;return <DebtDetailClient id={id}/>}
