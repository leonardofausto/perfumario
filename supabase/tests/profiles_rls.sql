begin;

do $$
declare
  profile_policy_count integer;
  avatar_policy_count integer;
  rls_enabled boolean;
  bucket_is_private boolean;
begin
  select relrowsecurity into rls_enabled
  from pg_class
  where oid = 'public.profiles'::regclass;

  if not rls_enabled then
    raise exception 'RLS is not enabled on public.profiles';
  end if;

  if not has_table_privilege('authenticated', 'public.profiles', 'select')
    or not has_table_privilege('authenticated', 'public.profiles', 'update') then
    raise exception 'Authenticated role is missing profile privileges';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'select')
    or has_table_privilege('anon', 'public.profiles', 'update') then
    raise exception 'Anon role unexpectedly has profile privileges';
  end if;

  select count(*) into profile_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename = 'profiles'
    and policyname in ('profiles_select_own', 'profiles_update_own')
    and coalesce(qual, '') like '%auth.uid()%';

  select count(*) into avatar_policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in (
      'avatars_select_own',
      'avatars_insert_own',
      'avatars_update_own',
      'avatars_delete_own'
    )
    and (coalesce(qual, '') || coalesce(with_check, '')) like '%foldername%'
    and (coalesce(qual, '') || coalesce(with_check, '')) like '%auth.uid()%';

  select not public into bucket_is_private
  from storage.buckets
  where id = 'private-avatars'
    and file_size_limit = 5242880
    and allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

  if profile_policy_count <> 2 then
    raise exception 'Expected two owner profile policies, got %', profile_policy_count;
  end if;

  if avatar_policy_count <> 4 then
    raise exception 'Expected four owner avatar policies, got %', avatar_policy_count;
  end if;

  if bucket_is_private is distinct from true then
    raise exception 'Private avatar bucket configuration is invalid';
  end if;
end;
$$;

rollback;
