import test from 'node:test'
import assert from 'node:assert/strict'

function daysInMonth(y:number,m:number){return new Date(y,m,0).getDate()}
function safeDate(start:Date,dueDay:number,offset:number){const raw=start.getMonth()+offset,y=start.getFullYear()+Math.floor(raw/12),m=((raw%12)+12)%12;return new Date(y,m,Math.min(dueDay,daysInMonth(y,m+1)))}
function schedule(financed:number,months:number,start:Date,dueDay:number){const candidate=safeDate(start,dueDay,0),first=candidate<new Date(start.getFullYear(),start.getMonth(),start.getDate())?1:0,base=Math.ceil(financed/months);let left=financed;return Array.from({length:months},(_,i)=>{const a=Math.min(base,left);left-=a;return {amount:a,due:safeDate(start,dueDay,first+i)}}).filter(x=>x.amount>0)}
test('installments sum exactly to financed amount',()=>assert.equal(schedule(10000001,6,new Date(2026,0,1),15).reduce((s,x)=>s+x.amount,0),10000001))
test('31st clamps to February last day',()=>assert.equal(schedule(200,2,new Date(2026,0,31),31)[1].due.getDate(),28))
