-- Qarz Nazorati — Supabase PostgreSQL schema
-- Run once in Supabase SQL Editor on a new project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  currency text not null default 'UZS' check (currency in ('UZS')),
  monthly_salary bigint not null default 0 check (monthly_salary >= 0),
  reminder_enabled boolean not null default true,
  reminder_days_before smallint not null default 1 check (reminder_days_before between 0 and 30),
  reminder_hour smallint not null default 9 check (reminder_hour between 0 and 23),
  timezone text not null default 'Asia/Tashkent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  type text not null default 'other' check (type in ('salary_extra','bonus','freelance','other')),
  amount bigint not null check (amount > 0),
  income_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  creditor text not null default '',
  total_amount bigint not null check (total_amount > 0),
  down_payment bigint not null default 0 check (down_payment >= 0),
  total_months integer not null check (total_months between 1 and 600),
  start_date date not null,
  due_day smallint not null check (due_day between 1 and 31),
  note text,
  reminder_enabled boolean not null default true,
  status text not null default 'active' check (status in ('active','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint down_payment_not_over_total check (down_payment <= total_amount)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  debt_id uuid not null references public.debts(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  amount bigint not null check (amount > 0),
  due_date date not null,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (debt_id, sequence)
);

create index if not exists incomes_user_date_idx on public.incomes(user_id, income_date desc);
create index if not exists debts_user_status_idx on public.debts(user_id, status);
create index if not exists payments_user_due_idx on public.payments(user_id, due_date);
create index if not exists payments_debt_idx on public.payments(debt_id, sequence);

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists incomes_touch_updated_at on public.incomes;
create trigger incomes_touch_updated_at before update on public.incomes for each row execute function public.touch_updated_at();
drop trigger if exists debts_touch_updated_at on public.debts;
create trigger debts_touch_updated_at before update on public.debts for each row execute function public.touch_updated_at();
drop trigger if exists payments_touch_updated_at on public.payments;
create trigger payments_touch_updated_at before update on public.payments for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.safe_payment_date(p_start date, p_due_day int, p_month_offset int)
returns date language plpgsql immutable set search_path = public as $$
declare target_month date; last_day date; safe_day int;
begin
  target_month := (date_trunc('month', p_start)::date + make_interval(months => p_month_offset))::date;
  last_day := (target_month + interval '1 month - 1 day')::date;
  safe_day := least(greatest(p_due_day, 1), extract(day from last_day)::int);
  return make_date(extract(year from target_month)::int, extract(month from target_month)::int, safe_day);
end; $$;

create or replace function public.create_debt(
  p_name text, p_creditor text, p_total_amount bigint, p_down_payment bigint,
  p_total_months int, p_start_date date, p_due_day int, p_note text default null,
  p_reminder_enabled boolean default true
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_debt uuid := gen_random_uuid(); v_financed bigint;
  v_base bigint; v_left bigint; v_amount bigint; v_first_offset int; v_candidate date; i int;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(trim(coalesce(p_name,''))) < 1 then raise exception 'NAME_REQUIRED'; end if;
  if p_total_amount <= 0 or p_down_payment < 0 or p_down_payment > p_total_amount then raise exception 'INVALID_AMOUNT'; end if;
  if p_total_months < 1 or p_total_months > 600 then raise exception 'INVALID_MONTHS'; end if;
  if p_due_day < 1 or p_due_day > 31 then raise exception 'INVALID_DUE_DAY'; end if;

  insert into public.debts(id,user_id,name,creditor,total_amount,down_payment,total_months,start_date,due_day,note,reminder_enabled,status)
  values(v_debt,v_user,trim(p_name),trim(coalesce(p_creditor,'')),p_total_amount,p_down_payment,p_total_months,p_start_date,p_due_day,p_note,p_reminder_enabled,case when p_down_payment=p_total_amount then 'completed' else 'active' end);

  v_financed := p_total_amount - p_down_payment;
  if v_financed = 0 then return v_debt; end if;
  v_base := (v_financed + p_total_months - 1) / p_total_months;
  v_left := v_financed;
  v_candidate := public.safe_payment_date(p_start_date,p_due_day,0);
  v_first_offset := case when v_candidate < p_start_date then 1 else 0 end;
  for i in 1..p_total_months loop
    exit when v_left <= 0;
    v_amount := least(v_base,v_left);
    insert into public.payments(user_id,debt_id,sequence,amount,due_date)
    values(v_user,v_debt,i,v_amount,public.safe_payment_date(p_start_date,p_due_day,v_first_offset+i-1));
    v_left := v_left-v_amount;
  end loop;
  return v_debt;
end; $$;

create or replace function public.update_debt(
  p_debt_id uuid, p_name text, p_creditor text, p_total_amount bigint, p_down_payment bigint,
  p_total_months int, p_start_date date, p_due_day int, p_note text default null,
  p_reminder_enabled boolean default true
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid(); v_financed bigint; v_paid_amount bigint; v_paid_count int; v_max_paid_seq int;
  v_remaining bigint; v_unpaid_count int; v_base bigint; v_left bigint; v_amount bigint; v_first_offset int; v_candidate date; i int;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists(select 1 from public.debts where id=p_debt_id and user_id=v_user) then raise exception 'DEBT_NOT_FOUND'; end if;
  if p_total_amount <= 0 or p_down_payment < 0 or p_down_payment > p_total_amount then raise exception 'INVALID_AMOUNT'; end if;
  if p_total_months < 1 or p_total_months > 600 then raise exception 'INVALID_MONTHS'; end if;
  if p_due_day < 1 or p_due_day > 31 then raise exception 'INVALID_DUE_DAY'; end if;

  select coalesce(sum(amount),0), count(*), coalesce(max(sequence),0)
    into v_paid_amount,v_paid_count,v_max_paid_seq
  from public.payments where debt_id=p_debt_id and user_id=v_user and paid_at is not null;

  v_financed := p_total_amount-p_down_payment;
  if v_paid_amount > v_financed then raise exception 'PAID_AMOUNT_EXCEEDS_NEW_FINANCED_AMOUNT'; end if;
  if v_max_paid_seq > p_total_months then raise exception 'MONTHS_BELOW_PAID_SEQUENCE'; end if;
  v_remaining := v_financed-v_paid_amount;
  v_unpaid_count := p_total_months-v_paid_count;
  if v_remaining > 0 and v_unpaid_count <= 0 then raise exception 'MONTHS_TOO_SMALL'; end if;

  update public.debts set name=trim(p_name), creditor=trim(coalesce(p_creditor,'')), total_amount=p_total_amount,
    down_payment=p_down_payment,total_months=p_total_months,start_date=p_start_date,due_day=p_due_day,note=p_note,
    reminder_enabled=p_reminder_enabled,status=case when v_remaining=0 then 'completed' else 'active' end
  where id=p_debt_id and user_id=v_user;

  delete from public.payments where debt_id=p_debt_id and user_id=v_user and paid_at is null;
  if v_remaining = 0 then return; end if;
  v_base := (v_remaining+v_unpaid_count-1)/v_unpaid_count;
  v_left := v_remaining;
  v_candidate := public.safe_payment_date(p_start_date,p_due_day,0);
  v_first_offset := case when v_candidate < p_start_date then 1 else 0 end;

  for i in 1..p_total_months loop
    if exists(select 1 from public.payments where debt_id=p_debt_id and sequence=i and paid_at is not null) then continue; end if;
    exit when v_left <= 0;
    v_amount := least(v_base,v_left);
    insert into public.payments(user_id,debt_id,sequence,amount,due_date)
    values(v_user,p_debt_id,i,v_amount,public.safe_payment_date(p_start_date,p_due_day,v_first_offset+i-1));
    v_left := v_left-v_amount;
  end loop;
end; $$;

create or replace function public.sync_debt_status() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_id uuid := coalesce(new.debt_id,old.debt_id); v_left bigint;
begin
  select coalesce(sum(amount) filter(where paid_at is null),0) into v_left from public.payments where debt_id=v_id;
  update public.debts set status=case when v_left=0 then 'completed' else 'active' end where id=v_id;
  return coalesce(new,old);
end; $$;

drop trigger if exists payments_sync_debt_status on public.payments;
create trigger payments_sync_debt_status after insert or update of paid_at or delete on public.payments for each row execute function public.sync_debt_status();

alter table public.profiles enable row level security;
alter table public.incomes enable row level security;
alter table public.debts enable row level security;
alter table public.payments enable row level security;

-- Recreate policies safely.
drop policy if exists profiles_own_select on public.profiles;
drop policy if exists profiles_own_update on public.profiles;
create policy profiles_own_select on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_own_update on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);


drop policy if exists incomes_own_all on public.incomes;
create policy incomes_own_all on public.incomes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists debts_own_all on public.debts;
create policy debts_own_all on public.debts for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists payments_own_all on public.payments;
create policy payments_own_all on public.payments for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke execute on function public.create_debt(text,text,bigint,bigint,int,date,int,text,boolean) from public, anon;
revoke execute on function public.update_debt(uuid,text,text,bigint,bigint,int,date,int,text,boolean) from public, anon;
grant execute on function public.create_debt(text,text,bigint,bigint,int,date,int,text,boolean) to authenticated;
grant execute on function public.update_debt(uuid,text,text,bigint,bigint,int,date,int,text,boolean) to authenticated;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.incomes to authenticated;
grant select, insert, update, delete on public.debts to authenticated;
grant select, insert, update, delete on public.payments to authenticated;
