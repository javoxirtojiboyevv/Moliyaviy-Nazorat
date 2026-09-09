'use client'
import { useEffect } from 'react'
export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {useEffect(()=>{const f=(e:KeyboardEvent)=>e.key==='Escape'&&onClose();window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onClose]);return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><header><h2>{title}</h2><button onClick={onClose} aria-label="Yopish">×</button></header>{children}</div></div>}
