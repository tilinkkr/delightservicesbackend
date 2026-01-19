
-- Health Leads Table
create table if not exists health_leads (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  mobile text not null,
  dob date,
  city text,
  coverage_type text,
  conditions text[] default '{}',
  status text default 'new', -- new, contacted, closed
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table health_leads enable row level security;

-- Policies
create policy "Public can insert health leads" on health_leads for insert with check (true);
create policy "Admins can view health leads" on health_leads for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
