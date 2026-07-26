create index perfume_notes_perfume_owner_idx
on public.perfume_notes (perfume_id, user_id);

create index perfume_scores_perfume_owner_idx
on public.perfume_scores (perfume_id, user_id);
