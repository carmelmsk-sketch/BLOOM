create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idea_id uuid references public.ideas(id) on delete set null,
  name text not null,
  project_type text not null default 'digital_product'
    check (project_type in ('digital_product', 'service', 'content', 'app', 'course', 'other')),
  objective text not null default '',
  description text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'planning', 'building', 'ready')),
  progress_percent integer not null default 0
    check (progress_percent between 0 and 100),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_projects_user_created
  on public.projects(user_id, created_at desc);

create index if not exists idx_projects_idea
  on public.projects(idea_id);

drop trigger if exists projects_updated_at on public.projects;

create trigger projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists projects_owner_select on public.projects;
create policy projects_owner_select
  on public.projects
  for select
  using (user_id = auth.uid());

drop policy if exists projects_owner_insert on public.projects;
create policy projects_owner_insert
  on public.projects
  for insert
  with check (user_id = auth.uid());

drop policy if exists projects_owner_update on public.projects;
create policy projects_owner_update
  on public.projects
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists projects_owner_delete on public.projects;
create policy projects_owner_delete
  on public.projects
  for delete
  using (user_id = auth.uid());


create table if not exists public.project_steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  step_key text not null
    check (step_key in ('define', 'prepare', 'build', 'test', 'finalize')),
  title text not null,
  position integer not null default 0,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint unique_project_step unique (project_id, step_key)
);

create index if not exists idx_project_steps_project
  on public.project_steps(project_id, position asc);

create index if not exists idx_project_steps_user
  on public.project_steps(user_id);

drop trigger if exists project_steps_updated_at on public.project_steps;

create trigger project_steps_updated_at
  before update on public.project_steps
  for each row
  execute function public.set_updated_at();

alter table public.project_steps enable row level security;

drop policy if exists project_steps_owner_select on public.project_steps;
create policy project_steps_owner_select
  on public.project_steps
  for select
  using (user_id = auth.uid());

drop policy if exists project_steps_owner_insert on public.project_steps;
create policy project_steps_owner_insert
  on public.project_steps
  for insert
  with check (user_id = auth.uid());

drop policy if exists project_steps_owner_update on public.project_steps;
create policy project_steps_owner_update
  on public.project_steps
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists project_steps_owner_delete on public.project_steps;
create policy project_steps_owner_delete
  on public.project_steps
  for delete
  using (user_id = auth.uid());
