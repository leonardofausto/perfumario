update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/avif',
  'image/webp'
]
where id = 'perfume-images';
