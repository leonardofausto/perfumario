begin;

do $$
declare
  table_name text;
  rls_enabled boolean;
  policy_count integer;
  bucket_is_private boolean;
  bucket_limit bigint;
  bucket_mime_types text[];
begin
  foreach table_name in array array['perfumes', 'perfume_notes', 'perfume_scores']
  loop
    if to_regclass(format('public.%I', table_name)) is null then
      raise exception 'Missing table public.%', table_name;
    end if;

    select relrowsecurity
    into rls_enabled
    from pg_class
    where oid = format('public.%I', table_name)::regclass;

    if rls_enabled is distinct from true then
      raise exception 'RLS is not enabled on public.%', table_name;
    end if;

    if has_table_privilege('anon', format('public.%I', table_name), 'select')
      or has_table_privilege('anon', format('public.%I', table_name), 'insert')
      or has_table_privilege('anon', format('public.%I', table_name), 'update')
      or has_table_privilege('anon', format('public.%I', table_name), 'delete') then
      raise exception 'Anon unexpectedly has privileges on public.%', table_name;
    end if;

    if not has_table_privilege('authenticated', format('public.%I', table_name), 'select')
      or not has_table_privilege('authenticated', format('public.%I', table_name), 'insert')
      or not has_table_privilege('authenticated', format('public.%I', table_name), 'update')
      or not has_table_privilege('authenticated', format('public.%I', table_name), 'delete') then
      raise exception 'Authenticated role is missing CRUD privileges on public.%', table_name;
    end if;
  end loop;

  select count(*)
  into policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in ('perfumes', 'perfume_notes', 'perfume_scores')
    and roles = array['authenticated'::name]
    and (coalesce(qual, '') || coalesce(with_check, '')) like '%auth.uid()%';

  if policy_count <> 12 then
    raise exception 'Expected twelve owner policies, got %', policy_count;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.perfumes'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (id, user_id)'
  ) then
    raise exception 'Missing composite perfume ownership key';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'perfumes'
      and indexdef like '%(user_id, legacy_key)%'
      and indexdef like '%WHERE (legacy_key IS NOT NULL)%'
  ) then
    raise exception 'Missing partial unique legacy key index';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.perfume_notes'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) like
        'FOREIGN KEY (perfume_id, user_id) REFERENCES perfumes(id, user_id) ON DELETE CASCADE%'
  ) then
    raise exception 'Notes are missing the cascading ownership foreign key';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.perfume_scores'::regclass
      and contype = 'f'
      and pg_get_constraintdef(oid) like
        'FOREIGN KEY (perfume_id, user_id) REFERENCES perfumes(id, user_id) ON DELETE CASCADE%'
  ) then
    raise exception 'Scores are missing the cascading ownership foreign key';
  end if;

  select
    not public,
    file_size_limit,
    allowed_mime_types
  into
    bucket_is_private,
    bucket_limit,
    bucket_mime_types
  from storage.buckets
  where id = 'perfume-images';

  if bucket_is_private is distinct from true
    or bucket_limit <> 5242880
    or bucket_mime_types <> array['image/jpeg', 'image/png', 'image/avif', 'image/webp'] then
    raise exception 'Private perfume image bucket configuration is invalid';
  end if;

  select count(*)
  into policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in (
      'perfume_images_select_own',
      'perfume_images_insert_own',
      'perfume_images_update_own',
      'perfume_images_delete_own'
    )
    and roles = array['authenticated'::name]
    and (coalesce(qual, '') || coalesce(with_check, ''))
      like '%bucket_id = ''perfume-images''%'
    and (coalesce(qual, '') || coalesce(with_check, ''))
      like '%foldername%'
    and (coalesce(qual, '') || coalesce(with_check, ''))
      like '%auth.uid()%';

  if policy_count <> 4 then
    raise exception 'Expected four owner perfume image policies, got %', policy_count;
  end if;
end;
$$;

rollback;
