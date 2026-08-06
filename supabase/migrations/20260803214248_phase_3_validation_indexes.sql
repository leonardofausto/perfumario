create index usage_logs_perfume_owner_idx
on public.usage_logs (perfume_id, user_id);

create index perfume_usage_entries_perfume_owner_idx
on public.perfume_usage_entries (perfume_id, user_id);

comment on index public.usage_logs_perfume_owner_idx is
  'Cobre a chave estrangeira composta de usos para perfumes do mesmo proprietário.';

comment on index public.perfume_usage_entries_perfume_owner_idx is
  'Cobre a chave estrangeira composta preservada no histórico legado.';
