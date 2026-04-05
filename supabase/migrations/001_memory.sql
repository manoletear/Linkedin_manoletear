create extension if not exists vector;

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  sectors text[] not null default '{}',
  keywords text[] not null default '{}',
  tone text not null default 'analytical',
  target_audience text,
  preferred_formats text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  title text not null,
  url text not null unique,
  summary text,
  published_at timestamptz,
  canonical_text text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists content_options (
  id uuid primary key default gen_random_uuid(),
  news_item_id uuid references news_items(id) on delete cascade,
  angle_title text not null,
  thesis text not null,
  format text not null,
  score numeric,
  created_at timestamptz not null default now()
);

create table if not exists drafts (
  id uuid primary key default gen_random_uuid(),
  content_option_id uuid references content_options(id) on delete cascade,
  variant int not null,
  full_text text not null,
  score numeric,
  selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists published_posts (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references drafts(id),
  linkedin_post_id text,
  media_type text,
  media_url text,
  published_at timestamptz not null default now()
);

create table if not exists post_metrics (
  id uuid primary key default gen_random_uuid(),
  published_post_id uuid references published_posts(id) on delete cascade,
  impressions int default 0,
  likes int default 0,
  comments int default 0,
  reposts int default 0,
  captured_at timestamptz not null default now()
);

create table if not exists memory_chunks (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  ref_id uuid,
  content text not null,
  embedding vector(384),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists memory_chunks_embedding_idx
on memory_chunks
using hnsw (embedding vector_cosine_ops);
