-- WriteNova Content Portal
-- Run this once in the Neon SQL Editor for the chosen project.

create table if not exists website_content (
  id text primary key check (id = 'website'),
  content jsonb not null,
  updated_at timestamptz not null default now()
);
