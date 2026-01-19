
-- Motor Leads Table
create table if not exists motor_leads (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  mobile text not null,
  vehicle_reg text,
  policy_type text, -- Comprehensive, Third Party
  status text default 'new', -- new, contacted, closed
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table motor_leads enable row level security;

-- Policies
create policy "Public can insert motor leads" on motor_leads for insert with check (true);
create policy "Admins can view motor leads" on motor_leads for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
