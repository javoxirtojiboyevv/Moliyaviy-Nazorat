import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PwaRegister } from '@/components/pwa-register'
export const metadata:Metadata={title:{default:'Qarz Nazorati',template:'%s · Qarz Nazorati'},description:'Daromad, qarz va bo‘lib to‘lashlarni boshqarish tizimi',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'Qarz Nazorati',statusBarStyle:'default'},icons:{apple:'/apple-touch-icon.png',icon:[{url:'/icon-192.png',sizes:'192x192',type:'image/png'},{url:'/icon-512.png',sizes:'512x512',type:'image/png'}]}}
export const viewport:Viewport={themeColor:'#f5f7fb',width:'device-width',initialScale:1,viewportFit:'cover'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}<PwaRegister/></body></html>}
