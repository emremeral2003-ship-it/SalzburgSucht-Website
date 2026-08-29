-- ===========================================================================
-- Salzburgsucht — Ausgangsschema
--
-- Ausfuehren im Supabase SQL-Editor. Region Frankfurt.
--
-- Die wichtigste Zeile dieser Datei ist nicht eine Tabelle, sondern Row Level
-- Security: Anonyme Besucher duerfen ausschliesslich EINFUEGEN, niemals lesen.
-- Ohne diese Regel waeren Kooperationsanfragen samt Budget mit dem oeffentlich
-- ausgelieferten anon-Key fuer jeden abrufbar.
-- ===========================================================================

-- --------------------------------------------------------------- Community
create table if not exists public.community_signups (
  id            uuid primary key default gen_random_uuid(),
  first_name    text        not null,
  email         text        not null,
  phone         text,
  interests     text[]      not null default '{}',
  consent_at    timestamptz not null default now(),
  -- Platz fuer den Double-Opt-In. Er wird gebraucht, sobald an diese Adressen
  -- ein Newsletter verschickt werden soll — vorher nicht.
  confirmed_at  timestamptz,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  traffic_source text,
  created_at    timestamptz not null default now()
);

-- Dieselbe Adresse soll nicht zweimal in der Liste stehen. Die Anwendung
-- schreibt sie klein, der Index setzt es durch.
create unique index if not exists community_signups_email_key
  on public.community_signups (email);

create index if not exists community_signups_created_at_idx
  on public.community_signups (created_at desc);

-- ----------------------------------------------------------- Kooperationen
do $$
begin
  if not exists (select 1 from pg_type where typname = 'cooperation_status') then
    create type public.cooperation_status as enum ('neu', 'in_pruefung', 'angebot', 'gewonnen', 'abgelehnt');
  end if;
end$$;

create table if not exists public.cooperation_requests (
  id                  uuid primary key default gen_random_uuid(),
  company             text not null,
  contact_name        text not null,
  email               text not null,
  phone               text,
  website             text,
  social_media        text,
  company_description text not null,
  promotion_type      text[] not null default '{}',
  cooperation_idea    text not null,
  goals               text[] not null default '{}',
  budget_range        text not null,
  concrete_budget     text,
  desired_period      text,
  message             text,
  -- Vorbereitet fuer den spaeteren Datei-Upload. Im MVP bleibt die Spalte leer.
  briefing_path       text,
  status              public.cooperation_status not null default 'neu',
  consent_at          timestamptz not null default now(),
  utm_source          text,
  utm_medium          text,
  utm_campaign        text,
  traffic_source      text,
  created_at          timestamptz not null default now()
);

create index if not exists cooperation_requests_created_at_idx
  on public.cooperation_requests (created_at desc);

-- ------------------------------------------------------------------- Jobs
create table if not exists public.jobs (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  company            text not null,
  title              text not null,
  location           text not null,
  employment_type    text not null,
  short_description  text not null,
  description        text not null,
  responsibilities   text[] not null default '{}',
  requirements       text[] not null default '{}',
  benefits           text[] not null default '{}',
  logo               text,
  application_type   text not null default 'email',
  application_url    text,
  application_email  text,
  published_at       date not null default current_date,
  active             boolean not null default true,
  featured           boolean not null default false,
  created_at         timestamptz not null default now(),

  -- Ein Inserat ohne Bewerbungsweg ist eine Sackgasse. Die Datenbank laesst
  -- das gar nicht erst zu.
  constraint jobs_application_target check (
    (application_type = 'url'   and application_url   is not null) or
    (application_type = 'email' and application_email is not null)
  )
);

create index if not exists jobs_active_published_idx
  on public.jobs (active, published_at desc);

-- --------------------------------------------------------------- Partner
create table if not exists public.partners (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  logo       text,
  website    text,
  sort_order integer not null default 0,
  visible    boolean not null default true
);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.community_signups   enable row level security;
alter table public.cooperation_requests enable row level security;
alter table public.jobs                enable row level security;
alter table public.partners            enable row level security;

-- Anonym: nur schreiben, nie lesen.
drop policy if exists "anon darf sich anmelden" on public.community_signups;
create policy "anon darf sich anmelden"
  on public.community_signups for insert to anon with check (true);

drop policy if exists "anon darf anfragen" on public.cooperation_requests;
create policy "anon darf anfragen"
  on public.cooperation_requests for insert to anon with check (true);

-- Aktive Jobs und sichtbare Partner sind oeffentliche Inhalte — Lesen ist hier
-- genau der Zweck.
drop policy if exists "jeder liest aktive jobs" on public.jobs;
create policy "jeder liest aktive jobs"
  on public.jobs for select to anon, authenticated using (active = true);

drop policy if exists "jeder liest sichtbare partner" on public.partners;
create policy "jeder liest sichtbare partner"
  on public.partners for select to anon, authenticated using (visible = true);

-- Angemeldete Redaktion: voller Zugriff.
drop policy if exists "redaktion verwaltet anmeldungen" on public.community_signups;
create policy "redaktion verwaltet anmeldungen"
  on public.community_signups for all to authenticated using (true) with check (true);

drop policy if exists "redaktion verwaltet anfragen" on public.cooperation_requests;
create policy "redaktion verwaltet anfragen"
  on public.cooperation_requests for all to authenticated using (true) with check (true);

drop policy if exists "redaktion verwaltet jobs" on public.jobs;
create policy "redaktion verwaltet jobs"
  on public.jobs for all to authenticated using (true) with check (true);

drop policy if exists "redaktion verwaltet partner" on public.partners;
create policy "redaktion verwaltet partner"
  on public.partners for all to authenticated using (true) with check (true);

-- ===========================================================================
-- Speicher fuer spaetere Briefing-Uploads
--
-- Privat, kein oeffentlicher Lesezugriff. Der Upload ist im MVP nicht
-- freigeschaltet; der Bucket steht bereit, damit die Freischaltung spaeter
-- keine Migration braucht.
-- ===========================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'briefings', 'briefings', false, 10485760,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do nothing;
