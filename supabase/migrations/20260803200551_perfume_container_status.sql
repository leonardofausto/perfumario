alter table public.perfumes
add column container_level text not null default 'unknown',
add column replenishment_intent text,
add column container_level_updated_at timestamptz;

alter table public.perfumes
add constraint perfumes_container_level_check check (
  container_level in ('unknown', 'full', 'half', 'low', 'empty')
),
add constraint perfumes_replenishment_intent_check check (
  replenishment_intent is null
  or (
    bottle_format = 'full_bottle'
    and replenishment_intent in ('buy_again', 'review_later', 'do_not_restock')
  )
  or (
    bottle_format = 'decant'
    and replenishment_intent in (
      'buy_decant',
      'buy_bottle',
      'review_later',
      'do_not_restock'
    )
  )
);

create index perfumes_owner_container_alert_idx
on public.perfumes (user_id, container_level)
where container_level in ('low', 'empty');

alter table public.perfumes enable row level security;
revoke all on table public.perfumes from public, anon;
grant select, insert, update, delete on table public.perfumes to authenticated;

create or replace function public.normalize_perfume_container_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.container_level is distinct from old.container_level then
    new.container_level_updated_at = pg_catalog.now();
  end if;

  if new.bottle_format is distinct from old.bottle_format then
    if new.bottle_format = 'full_bottle'
      and new.replenishment_intent not in (
        'buy_again',
        'review_later',
        'do_not_restock'
      ) then
      new.replenishment_intent = null;
    elsif new.bottle_format = 'decant'
      and new.replenishment_intent not in (
        'buy_decant',
        'buy_bottle',
        'review_later',
        'do_not_restock'
      ) then
      new.replenishment_intent = null;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.normalize_perfume_container_status() from public, anon;

drop trigger if exists normalize_perfume_container_status on public.perfumes;
create trigger normalize_perfume_container_status
before update of bottle_format, container_level on public.perfumes
for each row execute function public.normalize_perfume_container_status();
