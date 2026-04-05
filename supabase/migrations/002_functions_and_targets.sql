-- Funcion RPC para busqueda semantica en memory_chunks
create or replace function match_memory_chunks(
  query_embedding vector(384),
  match_count int default 5
)
returns table (
  id uuid,
  kind text,
  ref_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    mc.id,
    mc.kind,
    mc.ref_id,
    mc.content,
    mc.metadata,
    1 - (mc.embedding <=> query_embedding) as similarity
  from memory_chunks mc
  where mc.embedding is not null
  order by mc.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Funcion para obtener patrones de rendimiento
create or replace function get_performance_patterns()
returns json
language plpgsql
as $$
declare
  result json;
begin
  select json_build_object(
    'total_posts', (select count(*) from published_posts),
    'avg_likes', (select coalesce(avg(pm.likes), 0) from post_metrics pm),
    'avg_comments', (select coalesce(avg(pm.comments), 0) from post_metrics pm),
    'best_formats', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select pp.media_type as format,
               avg(pm.likes + pm.comments + pm.reposts) as avg_engagement,
               count(*) as post_count
        from published_posts pp
        left join post_metrics pm on pm.published_post_id = pp.id
        group by pp.media_type
        order by avg_engagement desc nulls last
        limit 5
      ) t
    ),
    'recent_performance', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json)
      from (
        select pp.id, pp.published_at, pp.media_type,
               d.full_text,
               pm.likes, pm.comments, pm.reposts, pm.impressions
        from published_posts pp
        left join drafts d on d.id = pp.draft_id
        left join post_metrics pm on pm.published_post_id = pp.id
        order by pp.published_at desc
        limit 10
      ) t
    )
  ) into result;
  return result;
end;
$$;

-- Tabla de scraping targets configurables
create table if not exists scraping_targets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  selectors jsonb not null,
  active boolean not null default true,
  last_scraped_at timestamptz,
  created_at timestamptz not null default now()
);

-- Targets por defecto
insert into scraping_targets (name, url, selectors) values
  ('McKinsey - AI', 'https://www.mckinsey.com/capabilities/quantumblack/our-insights',
   '{"articleList": "[class*=''item''], [class*=''card''], article", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''description'']", "date": "time, [class*=''date'']"}'::jsonb),
  ('BCG - AI', 'https://www.bcg.com/x/artificial-intelligence/insights',
   '{"articleList": "[class*=''card''], article", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''description'']", "date": "time, [class*=''date'']"}'::jsonb),
  ('Bain - AI', 'https://www.bain.com/insights/topics/artificial-intelligence/',
   '{"articleList": "[class*=''card''], article", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''description'']", "date": "time, [class*=''date'']"}'::jsonb),
  ('Deloitte - AI', 'https://www2.deloitte.com/us/en/pages/consulting/topics/ai-dossier.html',
   '{"articleList": "[class*=''card''], article, [class*=''promo'']", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''description'']", "date": "time, [class*=''date'']"}'::jsonb),
  ('Accenture - AI', 'https://www.accenture.com/us-en/insights/artificial-intelligence-summary-index',
   '{"articleList": "[class*=''card''], article", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''description'']", "date": "time, [class*=''date'']"}'::jsonb),
  ('MIT Sloan - AI', 'https://sloanreview.mit.edu/topic/artificial-intelligence-and-machine-learning/',
   '{"articleList": "article, [class*=''card'']", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''excerpt'']", "date": "time, [class*=''date'']", "author": "[class*=''author'']"}'::jsonb),
  ('Harvard Business Review - AI', 'https://hbr.org/topic/subject/ai-and-machine-learning',
   '{"articleList": "article, [class*=''stream-item'']", "title": "h3, h2, [class*=''title'']", "link": "a", "summary": "p, [class*=''dek'']", "date": "time, [class*=''date'']", "author": "[class*=''author'']"}'::jsonb)
on conflict (url) do nothing;

-- Programar ejecucion cada hora con pg_cron
-- NOTA: pg_cron debe estar habilitado en Supabase (Dashboard > Database > Extensions)
-- Descomentar despues de configurar SUPABASE_URL y ANON_KEY reales:

-- select cron.schedule(
--   'process-news-hourly',
--   '0 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://TU_PROJECT_REF.supabase.co/functions/v1/process-news',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer TU_SUPABASE_ANON_KEY'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
