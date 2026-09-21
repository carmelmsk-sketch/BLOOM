insert into public.profiles (
  id,
  display_name
)
select
  u.id,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''),
    nullif(
      trim(
        coalesce(u.raw_user_meta_data ->> 'first_name', '') ||
        ' ' ||
        coalesce(u.raw_user_meta_data ->> 'last_name', '')
      ),
      ''
    ),
    split_part(u.email, '@', 1)
  )
from auth.users u
on conflict (id) do nothing;
