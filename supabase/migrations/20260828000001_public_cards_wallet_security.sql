/*
  DigiCon critical production remediation.

  1. Allow anonymous visitors to read ACTIVE public cards only.
  2. Capture public leads through a security-definer RPC instead of direct
     anonymous INSERT access to contacts.
  3. Add subscriptions as the authoritative billing state.
  4. Provision profiles/eco_stats when an Auth user is created.
  5. Add an atomic eco contact counter.
*/

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'paypal',
  provider_subscription_id text not null,
  plan text not null check (plan in ('starter', 'growth', 'enterprise')),
  status text not null check (
    status in (
      'APPROVAL_PENDING',
      'ACTIVE',
      'SUSPENDED',
      'CANCELLED',
      'EXPIRED'
    )
  ),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_subscription_id)
);

alter table public.subscriptions enable row level security;

drop policy if exists "select_own_subscriptions"
on public.subscriptions;

create policy "select_own_subscriptions"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "select_active_public_cards"
on public.business_cards;

create policy "select_active_public_cards"
on public.business_cards
for select
to anon, authenticated
using (is_active = true);

create or replace function public.capture_public_contact(
  p_card_id uuid,
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_consent_given boolean default false
)
returns public.contacts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card public.business_cards%rowtype;
  v_contact public.contacts%rowtype;
begin
  if length(trim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'A valid name is required.';
  end if;

  if length(trim(coalesce(p_email, ''))) < 3 then
    raise exception 'A valid email is required.';
  end if;

  if p_consent_given is not true then
    raise exception 'Consent is required.';
  end if;

  select *
    into v_card
  from public.business_cards
  where id = p_card_id
    and is_active = true;

  if not found then
    raise exception 'Card not found.';
  end if;

  insert into public.contacts (
    user_id,
    card_id,
    full_name,
    email,
    phone,
    company,
    job_title,
    notes,
    consent_given,
    consent_date,
    source,
    status,
    synced_to_crm
  )
  values (
    v_card.user_id,
    v_card.id,
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone, '')), ''),
    '',
    '',
    'Captured from public DigiCon card',
    true,
    now(),
    'qr',
    'new',
    false
  )
  returning * into v_contact;

  insert into public.eco_stats (
    user_id,
    contacts_saved
  )
  values (
    v_card.user_id,
    1
  )
  on conflict (user_id)
  do update set
    contacts_saved = public.eco_stats.contacts_saved + 1,
    updated_at = now();

  return v_contact;
end;
$$;

revoke all on function public.capture_public_contact(
  uuid,
  text,
  text,
  text,
  boolean
)
from public;

grant execute on function public.capture_public_contact(
  uuid,
  text,
  text,
  text,
  boolean
)
to anon, authenticated;

create or replace function public.increment_eco_contacts_saved(
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.eco_stats (
    user_id,
    contacts_saved
  )
  values (
    p_user_id,
    1
  )
  on conflict (user_id)
  do update set
    contacts_saved = public.eco_stats.contacts_saved + 1,
    updated_at = now();
end;
$$;

revoke all on function public.increment_eco_contacts_saved(uuid)
from public;

grant execute on function public.increment_eco_contacts_saved(uuid)
to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    company_name
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'company_name', '')
  )
  on conflict (id)
  do update set
    email = excluded.email,
    full_name = case
      when coalesce(public.profiles.full_name, '') = ''
        then excluded.full_name
      else public.profiles.full_name
    end,
    company_name = case
      when coalesce(public.profiles.company_name, '') = ''
        then excluded.company_name
      else public.profiles.company_name
    end,
    updated_at = now();

  insert into public.eco_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create index if not exists idx_subscriptions_user_id
on public.subscriptions(user_id);

create index if not exists idx_subscriptions_status
on public.subscriptions(status);

create index if not exists idx_business_cards_active
on public.business_cards(is_active);
