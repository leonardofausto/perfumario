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
    olfactory_families
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
    p_olfactory_families
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
    olfactory_families = p_olfactory_families
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
  jsonb,
  jsonb
) to authenticated;
