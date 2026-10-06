-- Personality Type Explorer V9
create extension if not exists pgcrypto;

create table if not exists questionnaire_versions (
  id uuid primary key default gen_random_uuid(),
  version text unique not null,
  title text not null,
  status text not null default 'prototype' check (status in ('prototype','pilot','validated','retired')),
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id bigserial primary key,
  questionnaire_version text not null,
  question_no int not null,
  dimension text not null check (dimension in ('EI','SN','TF','JP')),
  direction smallint not null check (direction in (-1,1)),
  question_text text not null,
  left_label text not null,
  right_label text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(questionnaire_version, question_no)
);

create table if not exists assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  questionnaire_version text not null,
  consent_research boolean not null default false,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists responses (
  id bigserial primary key,
  session_id uuid not null references assessment_sessions(id) on delete cascade,
  question_no int not null,
  answer smallint not null check (answer between 1 and 7),
  created_at timestamptz not null default now(),
  unique(session_id, question_no)
);

create table if not exists assessment_results (
  session_id uuid primary key references assessment_sessions(id) on delete cascade,
  closest_type text not null,
  ei_score smallint not null check (ei_score between 0 and 100),
  sn_score smallint not null check (sn_score between 0 and 100),
  tf_score smallint not null check (tf_score between 0 and 100),
  jp_score smallint not null check (jp_score between 0 and 100),
  calculated_at timestamptz not null default now()
);

create table if not exists share_results (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  type text not null,
  ei_score smallint not null check (ei_score between 0 and 100),
  sn_score smallint not null check (sn_score between 0 and 100),
  tf_score smallint not null check (tf_score between 0 and 100),
  jp_score smallint not null check (jp_score between 0 and 100),
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists idx_share_results_token on share_results(token);
create index if not exists idx_sessions_completed_at on assessment_sessions(completed_at);

alter table questionnaire_versions enable row level security;
alter table questions enable row level security;
alter table assessment_sessions enable row level security;
alter table responses enable row level security;
alter table assessment_results enable row level security;
alter table share_results enable row level security;

-- Questions can be read publicly. All writes and share-result access are handled server-side with the service role.
drop policy if exists "public read questions" on questions;
create policy "public read questions" on questions for select using (is_active = true);

drop policy if exists "public read questionnaire versions" on questionnaire_versions;
create policy "public read questionnaire versions" on questionnaire_versions for select using (true);
