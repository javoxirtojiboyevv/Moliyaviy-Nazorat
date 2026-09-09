import test from 'node:test'
import assert from 'node:assert/strict'
import { commitmentForMonth, debtProgress, debtRemaining, incomeForMonth, parseMoney } from '../src/lib/finance.ts'

const debt:any={id:'d',user_id:'u',name:'Phone',creditor:'',total_amount:12000000,down_payment:2000000,total_months:10,start_date:'2026-01-01',due_day:15,note:null,reminder_enabled:true,status:'active',created_at:'',updated_at:'',payments:[
{id:'1',user_id:'u',debt_id:'d',sequence:1,amount:1000000,due_date:'2026-01-15',paid_at:'2026-01-15',created_at:'',updated_at:''},
{id:'2',user_id:'u',debt_id:'d',sequence:2,amount:1000000,due_date:'2026-02-15',paid_at:null,created_at:'',updated_at:''},
{id:'3',user_id:'u',debt_id:'d',sequence:3,amount:1000000,due_date:'2026-03-15',paid_at:null,created_at:'',updated_at:''},
]}

test('money input strips separators',()=>assert.equal(parseMoney('15 000 000 so‘m'),15000000))
test('income = salary + current month extras',()=>assert.equal(incomeForMonth(15000000,[{amount:2000000,income_date:'2026-03-09'} as any],new Date(2026,2,1)),17000000))
test('remaining debt sums unpaid installments',()=>assert.equal(debtRemaining(debt),2000000))
test('progress includes down payment and paid installments',()=>assert.equal(debtProgress(debt),3000000/12000000))
test('commitment includes overdue + current scheduled',()=>assert.equal(commitmentForMonth([debt],new Date(2026,2,1)),2000000))
