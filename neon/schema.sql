-- WriteNova Content Portal
-- Run this once in the Neon SQL Editor for the chosen project.

create table if not exists website_content (
  id text primary key check (id = 'website'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);

-- Analytics: one row per homepage view, used to chart visits per day/week/month.
create table if not exists page_visits (
  id bigint generated always as identity primary key,
  path text not null default '/',
  visited_at timestamptz not null default now()
);
create index if not exists page_visits_visited_at_idx on page_visits (visited_at);

-- Analytics: one row per successful project-inquiry email, used to chart
-- submissions per day/week/month alongside a short reference for the client.
create table if not exists form_submissions (
  id bigint generated always as identity primary key,
  full_name text not null,
  service text not null,
  submitted_at timestamptz not null default now()
);
create index if not exists form_submissions_submitted_at_idx on form_submissions (submitted_at);
