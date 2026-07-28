alter table public.perfumes
drop constraint if exists perfumes_concentration_check;

alter table public.perfumes
add constraint perfumes_concentration_check
check (
  concentration in (
    'unknown',
    'parfum',
    'eau_de_parfum',
    'eau_de_toilette',
    'eau_de_cologne',
    'body_splash',
    'perfume_oil',
    'other'
  )
);
