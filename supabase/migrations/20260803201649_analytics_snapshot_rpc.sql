create index perfumes_owner_created_at_idx
on public.perfumes (user_id, created_at);

create function public.get_analytics_snapshot(
  p_user_id uuid,
  p_period text,
  p_timezone text,
  p_now timestamptz default now()
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_from timestamptz;
  v_to timestamptz := p_now;
  v_local_from timestamp;
  v_local_to timestamp := p_now at time zone p_timezone;
  v_step interval;
  v_bucket_format text;
  v_result jsonb;
begin
  if p_user_id is distinct from (select auth.uid()) then
    raise exception 'Analytics owner is outside the authenticated session';
  end if;

  if p_period not in ('7d', '30d', '90d', 'year', 'all') then
    raise exception 'Unsupported analytics period';
  end if;

  if not exists (
    select 1 from pg_catalog.pg_timezone_names where name = p_timezone
  ) then
    raise exception 'Unsupported analytics timezone';
  end if;

  if p_period = '7d' then
    v_local_from := pg_catalog.date_trunc('day', v_local_to) - interval '6 days';
    v_step := interval '1 day';
    v_bucket_format := 'YYYY-MM-DD';
  elsif p_period = '30d' then
    v_local_from := pg_catalog.date_trunc('day', v_local_to) - interval '29 days';
    v_step := interval '1 day';
    v_bucket_format := 'YYYY-MM-DD';
  elsif p_period = '90d' then
    v_local_from := pg_catalog.date_trunc('day', v_local_to) - interval '89 days';
    v_step := interval '1 day';
    v_bucket_format := 'YYYY-MM-DD';
  elsif p_period = 'year' then
    v_local_from := pg_catalog.date_trunc('year', v_local_to);
    v_step := interval '1 month';
    v_bucket_format := 'YYYY-MM';
  else
    select pg_catalog.date_trunc(
      'month',
      coalesce(
        least(
          min(p.created_at) filter (where p.created_at is not null),
          min(u.used_at) filter (where u.used_at is not null)
        ) at time zone p_timezone,
        v_local_to
      )
    )
    into v_local_from
    from public.perfumes p
    left join public.usage_logs u
      on u.perfume_id = p.id
      and u.user_id = p.user_id
    where p.user_id = p_user_id;

    v_step := interval '1 month';
    v_bucket_format := 'YYYY-MM';
  end if;

  v_from := v_local_from at time zone p_timezone;

  with
  filtered_usage as materialized (
    select
      u.*,
      p.name as perfume_name,
      pg_catalog.to_char(u.used_at at time zone p_timezone, v_bucket_format) as bucket
    from public.usage_logs u
    join public.perfumes p
      on p.id = u.perfume_id
      and p.user_id = u.user_id
    where u.user_id = p_user_id
      and u.used_at >= v_from
      and u.used_at < v_to
  ),
  usage_totals as (
    select
      count(*)::integer as total,
      count(distinct (used_at at time zone p_timezone)::date)::integer as days_used,
      count(distinct perfume_id)::integer as unique_perfumes,
      coalesce(sum(compliments_count), 0)::integer as compliments_total,
      count(*) filter (where compliments_count > 0)::integer as complimented_uses,
      avg(satisfaction)::numeric as satisfaction_average,
      count(satisfaction)::integer as satisfaction_count,
      avg(performance_rating)::numeric as performance_average,
      count(performance_rating)::integer as performance_count,
      min(used_at) as earliest_usage,
      max(used_at) as latest_usage
    from filtered_usage
  ),
  usage_by_perfume as (
    select
      perfume_id,
      perfume_name,
      count(*)::integer as usage_count,
      sum(compliments_count)::integer as compliments_total,
      avg(satisfaction)::numeric as satisfaction_average,
      count(satisfaction)::integer as satisfaction_count,
      avg(performance_rating)::numeric as performance_average,
      count(performance_rating)::integer as performance_count,
      max(used_at) as latest_usage
    from filtered_usage
    group by perfume_id, perfume_name
  ),
  bucket_keys as (
    select pg_catalog.to_char(bucket, v_bucket_format) as bucket
    from pg_catalog.generate_series(
      v_local_from,
      pg_catalog.date_trunc(
        case when v_step = interval '1 day' then 'day' else 'month' end,
        v_local_to
      ),
      v_step
    ) bucket
  ),
  collection_totals as (
    select
      count(*)::integer as total,
      count(*) filter (where is_favorite)::integer as favorites,
      count(distinct brand)::integer as distinct_brands,
      count(*) filter (where container_level = 'low')::integer as low,
      count(*) filter (where container_level = 'empty')::integer as empty
    from public.perfumes
    where user_id = p_user_id
  )
  select pg_catalog.jsonb_build_object(
    'meta', pg_catalog.jsonb_build_object(
      'period', p_period,
      'timezone', p_timezone,
      'from', v_from,
      'to', v_to,
      'buckets', coalesce(
        (select pg_catalog.jsonb_agg(bucket order by bucket) from bucket_keys),
        '[]'::jsonb
      )
    ),
    'collection', pg_catalog.jsonb_build_object(
      'hasData', (select total > 0 from collection_totals),
      'total', (select total from collection_totals),
      'favorites', (select favorites from collection_totals),
      'distinctBrands', (select distinct_brands from collection_totals),
      'byBrand', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('key', brand, 'value', total)
          order by total desc, brand
        )
        from (
          select brand, count(*)::integer as total
          from public.perfumes
          where user_id = p_user_id
          group by brand
        ) grouped
      ), '[]'::jsonb),
      'byCategory', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('key', category_type, 'value', total)
          order by total desc, category_type
        )
        from (
          select category_type, count(*)::integer as total
          from public.perfumes
          where user_id = p_user_id and category_type is not null
          group by category_type
        ) grouped
      ), '[]'::jsonb),
      'byConcentration', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('key', concentration, 'value', total)
          order by total desc, concentration
        )
        from (
          select concentration, count(*)::integer as total
          from public.perfumes
          where user_id = p_user_id
          group by concentration
        ) grouped
      ), '[]'::jsonb),
      'growth', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('bucket', bucket, 'value', total)
          order by bucket
        )
        from (
          select
            pg_catalog.to_char(created_at at time zone p_timezone, v_bucket_format) as bucket,
            count(*)::integer as total
          from public.perfumes
          where user_id = p_user_id
            and created_at >= v_from
            and created_at < v_to
          group by 1
        ) grouped
      ), '[]'::jsonb),
      'low', (select low from collection_totals),
      'empty', (select empty from collection_totals)
    ),
    'usage', pg_catalog.jsonb_build_object(
      'hasData', (select total > 0 from usage_totals),
      'total', (select total from usage_totals),
      'daysUsed', (select days_used from usage_totals),
      'uniquePerfumes', (select unique_perfumes from usage_totals),
      'averagePerWeek', (
        select case
          when total = 0 then null
          else pg_catalog.round(
            total / greatest(
              extract(epoch from (
                v_to - case when p_period = 'all' then earliest_usage else v_from end
              ))::numeric / 604800,
              1
            ),
            2
          )
        end
        from usage_totals
      ),
      'mostUsed', (
        select pg_catalog.jsonb_build_object(
          'perfumeId', perfume_id,
          'name', perfume_name,
          'value', usage_count,
          'sampleSize', usage_count
        )
        from usage_by_perfume
        order by usage_count desc, perfume_name, perfume_id
        limit 1
      ),
      'leastUsed', (
        select pg_catalog.jsonb_build_object(
          'perfumeId', perfume_id,
          'name', perfume_name,
          'value', usage_count,
          'sampleSize', usage_count
        )
        from usage_by_perfume
        order by usage_count, perfume_name, perfume_id
        limit 1
      ),
      'daysSinceLastUse', (
        select case when latest_usage is null then null else
          ((v_to at time zone p_timezone)::date -
           (latest_usage at time zone p_timezone)::date)::integer
        end
        from usage_totals
      ),
      'forgotten', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'perfumeId', p.id,
            'name', p.name,
            'lastUsedAt', last_usage.used_at,
            'daysSinceLastUse', case when last_usage.used_at is null then null else
              ((v_to at time zone p_timezone)::date -
               (last_usage.used_at at time zone p_timezone)::date)::integer
            end
          )
          order by p.name, p.id
        )
        from public.perfumes p
        left join lateral (
          select max(u.used_at) as used_at
          from public.usage_logs u
          where u.user_id = p_user_id and u.perfume_id = p.id
        ) last_usage on true
        where p.user_id = p_user_id
          and not exists (
            select 1 from filtered_usage fu where fu.perfume_id = p.id
          )
      ), '[]'::jsonb),
      'series', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('bucket', bucket, 'value', total)
          order by bucket
        )
        from (
          select bucket, count(*)::integer as total
          from filtered_usage
          group by bucket
        ) grouped
      ), '[]'::jsonb)
    ),
    'compliments', pg_catalog.jsonb_build_object(
      'total', (
        select pg_catalog.jsonb_build_object(
          'status', case when total = 0 then 'empty' else 'available' end,
          'value', case when total = 0 then null else compliments_total end,
          'sampleSize', total
        ) from usage_totals
      ),
      'usesWithCompliments', (
        select pg_catalog.jsonb_build_object(
          'status', case when total = 0 then 'empty' else 'available' end,
          'value', case when total = 0 then null else complimented_uses end,
          'sampleSize', total
        ) from usage_totals
      ),
      'usageRate', (
        select pg_catalog.jsonb_build_object(
          'status', case when total = 0 then 'empty' else 'available' end,
          'value', case when total = 0 then null else complimented_uses::numeric / total end,
          'sampleSize', total
        ) from usage_totals
      ),
      'mostComplimented', (
        select pg_catalog.jsonb_build_object(
          'perfumeId', perfume_id,
          'name', perfume_name,
          'value', compliments_total,
          'sampleSize', usage_count
        )
        from usage_by_perfume
        where compliments_total > 0
        order by compliments_total desc, perfume_name, perfume_id
        limit 1
      ),
      'byOccasion', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'key', occasion_key,
            'value', total,
            'sampleSize', sample_size
          ) order by occasion_key
        )
        from (
          select occasion_key, sum(compliments_count)::integer as total, count(*)::integer as sample_size
          from filtered_usage group by occasion_key
        ) grouped
      ), '[]'::jsonb),
      'byTime', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'key', time_key,
            'value', total,
            'sampleSize', sample_size
          ) order by time_key
        )
        from (
          select time_key, sum(compliments_count)::integer as total, count(*)::integer as sample_size
          from filtered_usage group by time_key
        ) grouped
      ), '[]'::jsonb),
      'byClimate', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'key', weather_condition,
            'value', total,
            'sampleSize', sample_size
          ) order by weather_condition
        )
        from (
          select weather_condition, sum(compliments_count)::integer as total, count(*)::integer as sample_size
          from filtered_usage
          where weather_condition is not null
          group by weather_condition
        ) grouped
      ), '[]'::jsonb)
    ),
    'satisfaction', pg_catalog.jsonb_build_object(
      'average', (
        select pg_catalog.jsonb_build_object(
          'status', case when satisfaction_count = 0 then 'empty' else 'available' end,
          'value', case when satisfaction_count = 0 then null else pg_catalog.round(satisfaction_average, 2) end,
          'sampleSize', satisfaction_count
        ) from usage_totals
      ),
      'bestAverage', (
        select pg_catalog.jsonb_build_object(
          'perfumeId', perfume_id,
          'name', perfume_name,
          'value', pg_catalog.round(satisfaction_average, 2),
          'sampleSize', satisfaction_count
        )
        from usage_by_perfume
        where satisfaction_count > 0
        order by satisfaction_average desc, perfume_name, perfume_id
        limit 1
      ),
      'distribution', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object('key', satisfaction::text, 'value', total)
          order by satisfaction
        )
        from (
          select satisfaction, count(*)::integer as total
          from filtered_usage group by satisfaction
        ) grouped
      ), '[]'::jsonb),
      'byOccasion', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'key', occasion_key,
            'value', pg_catalog.round(average, 2),
            'sampleSize', sample_size
          ) order by occasion_key
        )
        from (
          select occasion_key, avg(satisfaction)::numeric as average, count(*)::integer as sample_size
          from filtered_usage group by occasion_key
        ) grouped
      ), '[]'::jsonb),
      'byClimate', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'key', weather_condition,
            'value', pg_catalog.round(average, 2),
            'sampleSize', sample_size
          ) order by weather_condition
        )
        from (
          select weather_condition, avg(satisfaction)::numeric as average, count(*)::integer as sample_size
          from filtered_usage
          where weather_condition is not null
          group by weather_condition
        ) grouped
      ), '[]'::jsonb)
    ),
    'performance', pg_catalog.jsonb_build_object(
      'average', (
        select pg_catalog.jsonb_build_object(
          'status', case when performance_count = 0 then 'empty' else 'available' end,
          'value', case when performance_count = 0 then null else pg_catalog.round(performance_average, 2) end,
          'sampleSize', performance_count
        ) from usage_totals
      ),
      'bestResults', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'perfumeId', perfume_id,
            'name', perfume_name,
            'value', pg_catalog.round(performance_average, 2),
            'sampleSize', performance_count
          )
          order by performance_average desc, perfume_name, perfume_id
        )
        from usage_by_perfume
        where performance_count > 0
      ), '[]'::jsonb),
      'complimentRelation', coalesce((
        select pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'key', performance_rating::text,
            'value', pg_catalog.round(avg_compliments, 2),
            'sampleSize', sample_size,
            'complimentUsageRate', pg_catalog.round(complimented_uses::numeric / sample_size, 4)
          ) order by performance_rating
        )
        from (
          select
            performance_rating,
            avg(compliments_count)::numeric as avg_compliments,
            count(*)::integer as sample_size,
            count(*) filter (where compliments_count > 0)::integer as complimented_uses
          from filtered_usage
          where performance_rating is not null
          group by performance_rating
        ) grouped
      ), '[]'::jsonb)
    )
  )
  into v_result;

  return v_result;
end;
$$;

comment on function public.get_analytics_snapshot(uuid, text, text, timestamptz) is
  'Agrega métricas privadas e reais da coleção e do Diário de uso por período e timezone.';

revoke all on function public.get_analytics_snapshot(uuid, text, text, timestamptz)
from public, anon;
grant execute on function public.get_analytics_snapshot(uuid, text, text, timestamptz)
to authenticated;
