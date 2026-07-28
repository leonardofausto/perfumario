alter table public.perfumes
add column launch_year integer check (
  launch_year is null
  or launch_year between 1800 and 2200
),
add column category_type text,
add column audience text,
add column intensity integer check (
  intensity is null
  or intensity between 0 and 100
),
add column sweetness integer check (
  sweetness is null
  or sweetness between 0 and 100
),
add column freshness integer check (
  freshness is null
  or freshness between 0 and 100
),
add column elegance integer check (
  elegance is null
  or elegance between 0 and 100
),
add column sensuality integer check (
  sensuality is null
  or sensuality between 0 and 100
),
add column profile_tags text[] not null default '{}';

alter table public.perfumes
add constraint perfumes_category_type_check check (
  category_type is null
  or nullif(btrim(category_type), '') is not null
),
add constraint perfumes_audience_check check (
  audience is null
  or nullif(btrim(audience), '') is not null
),
add constraint perfumes_profile_tags_check check (
  array_position(profile_tags, null) is null
);

drop function public.create_perfume(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  jsonb,
  jsonb
);

drop function public.update_perfume(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  jsonb,
  jsonb
);

create function public.create_perfume(
  p_user_id uuid,
  p_brand text,
  p_name text,
  p_description text,
  p_concentration text,
  p_bottle_format text,
  p_inspiration_kind text,
  p_inspired_by text,
  p_olfactory_families text[],
  p_launch_year integer,
  p_category_type text,
  p_audience text,
  p_intensity integer,
  p_sweetness integer,
  p_freshness integer,
  p_elegance integer,
  p_sensuality integer,
  p_profile_tags text[],
  p_notes jsonb,
  p_scores jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  perfume_id uuid;
begin
  if p_user_id is distinct from (select auth.uid()) then
    raise exception 'Perfume owner is outside the authenticated session';
  end if;

  insert into public.perfumes (
    user_id,
    brand,
    name,
    description,
    concentration,
    bottle_format,
    inspiration_kind,
    inspired_by,
    olfactory_families,
    launch_year,
    category_type,
    audience,
    intensity,
    sweetness,
    freshness,
    elegance,
    sensuality,
    profile_tags
  )
  values (
    p_user_id,
    p_brand,
    p_name,
    p_description,
    p_concentration,
    p_bottle_format,
    p_inspiration_kind,
    p_inspired_by,
    p_olfactory_families,
    p_launch_year,
    p_category_type,
    p_audience,
    p_intensity,
    p_sweetness,
    p_freshness,
    p_elegance,
    p_sensuality,
    p_profile_tags
  )
  returning id into perfume_id;

  insert into public.perfume_notes (
    perfume_id,
    user_id,
    layer,
    note,
    display_order
  )
  select
    perfume_id,
    p_user_id,
    item.layer,
    item.note,
    item.display_order
  from pg_catalog.jsonb_to_recordset(p_notes) as item(
    layer text,
    note text,
    display_order integer
  );

  insert into public.perfume_scores (
    perfume_id,
    user_id,
    category,
    metric_key,
    score
  )
  select
    perfume_id,
    p_user_id,
    item.category,
    item.metric_key,
    item.score
  from pg_catalog.jsonb_to_recordset(p_scores) as item(
    category text,
    metric_key text,
    score integer
  );

  return perfume_id;
end;
$$;

create function public.update_perfume(
  p_id uuid,
  p_user_id uuid,
  p_brand text,
  p_name text,
  p_description text,
  p_concentration text,
  p_bottle_format text,
  p_inspiration_kind text,
  p_inspired_by text,
  p_olfactory_families text[],
  p_launch_year integer,
  p_category_type text,
  p_audience text,
  p_intensity integer,
  p_sweetness integer,
  p_freshness integer,
  p_elegance integer,
  p_sensuality integer,
  p_profile_tags text[],
  p_notes jsonb,
  p_scores jsonb
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_user_id is distinct from (select auth.uid()) then
    raise exception 'Perfume owner is outside the authenticated session';
  end if;

  update public.perfumes
  set
    brand = p_brand,
    name = p_name,
    description = p_description,
    concentration = p_concentration,
    bottle_format = p_bottle_format,
    inspiration_kind = p_inspiration_kind,
    inspired_by = p_inspired_by,
    olfactory_families = p_olfactory_families,
    launch_year = p_launch_year,
    category_type = p_category_type,
    audience = p_audience,
    intensity = p_intensity,
    sweetness = p_sweetness,
    freshness = p_freshness,
    elegance = p_elegance,
    sensuality = p_sensuality,
    profile_tags = p_profile_tags
  where id = p_id
    and user_id = p_user_id;

  if not found then
    return false;
  end if;

  delete from public.perfume_notes
  where perfume_id = p_id
    and user_id = p_user_id;

  delete from public.perfume_scores
  where perfume_id = p_id
    and user_id = p_user_id;

  insert into public.perfume_notes (
    perfume_id,
    user_id,
    layer,
    note,
    display_order
  )
  select
    p_id,
    p_user_id,
    item.layer,
    item.note,
    item.display_order
  from pg_catalog.jsonb_to_recordset(p_notes) as item(
    layer text,
    note text,
    display_order integer
  );

  insert into public.perfume_scores (
    perfume_id,
    user_id,
    category,
    metric_key,
    score
  )
  select
    p_id,
    p_user_id,
    item.category,
    item.metric_key,
    item.score
  from pg_catalog.jsonb_to_recordset(p_scores) as item(
    category text,
    metric_key text,
    score integer
  );

  return true;
end;
$$;

revoke all on function public.create_perfume(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  integer,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  text[],
  jsonb,
  jsonb
) from public, anon;

revoke all on function public.update_perfume(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  integer,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  text[],
  jsonb,
  jsonb
) from public, anon;

grant execute on function public.create_perfume(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  integer,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  text[],
  jsonb,
  jsonb
) to authenticated;

grant execute on function public.update_perfume(
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  integer,
  text,
  text,
  integer,
  integer,
  integer,
  integer,
  integer,
  text[],
  jsonb,
  jsonb
) to authenticated;
