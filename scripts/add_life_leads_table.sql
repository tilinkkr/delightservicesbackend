
-- Life Leads Table
create table if not exists life_leads (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  nominee_name text,
  phone text not null,
  email text,
  sum_assured text,
  tenure integer,
  riders text[] default '{}',
  status text default 'new', -- new, contacted, closed
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table life_leads enable row level security;

-- Policies
create policy "Public can insert life leads" on life_leads for insert with check (true);
create policy "Admins can view life leads" on life_leads for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
