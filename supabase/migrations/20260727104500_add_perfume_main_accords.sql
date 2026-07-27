alter table public.perfume_scores
drop constraint if exists perfume_scores_category_check;

alter table public.perfume_scores
add constraint perfume_scores_category_check
check (category in ('accord', 'performance', 'season', 'occasion', 'time'));

alter table public.perfume_scores
drop constraint if exists perfume_scores_category_metric_key;

alter table public.perfume_scores
add constraint perfume_scores_category_metric_key check (
  (
    category = 'accord'
    and nullif(btrim(metric_key), '') is not null
  )
  or (category = 'performance' and metric_key in (
    'fixacao',
    'projecao',
    'rastro',
    'versatilidade',
    'presenca'
  ))
  or (category = 'season' and metric_key in (
    'primavera',
    'verao',
    'outono',
    'inverno'
  ))
  or (category = 'occasion' and metric_key in (
    'trabalho',
    'casual',
    'encontro',
    'formal',
    'festa',
    'ar_livre'
  ))
  or (category = 'time' and metric_key in (
    'manha',
    'tarde',
    'noite',
    'madrugada'
  ))
);
