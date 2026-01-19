-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  role text check (role in ('admin', 'user')) default 'user',
  full_name text,
  is_vip boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure role column exists (idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
    alter table profiles add column role text check (role in ('admin', 'user')) default 'user';
  end if;
end $$;

-- 2. Products Table
create table if not exists products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text,
  price numeric not null,
  stock int default 0,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Orders Table
create table if not exists orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  total_amount numeric not null,
  status text check (status in ('pending', 'shipped', 'delivered')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Order Items Table
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders on delete cascade,
  product_id uuid references products,
  quantity int not null,
  price_at_purchase numeric not null
);

-- 5. Inquiries Table
create table if not exists inquiries (
  id uuid default uuid_generate_v4() primary key,
  email text,
  message text,
  status text check (status in ('open', 'resolved')) default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- SECURITY: Row Level Security (RLS)
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inquiries enable row level security;

-- POLICIES

-- Profiles:
-- Users can read own profile
create policy "Users can see own profile" on profiles for select using (auth.uid() = id);
-- Admins can see all profiles (Assuming admin check is reliable)
create policy "Admins can see all profiles" on profiles for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Products:
-- Everyone can read active products
create policy "Public can read products" on products for select using (true);
-- Only admins can insert/update/delete
create policy "Admins full access products" on products for all using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Orders:
-- Users can read own orders
create policy "Users can see own orders" on orders for select using (auth.uid() = user_id);
-- Admins can see all orders
create policy "Admins can see all orders" on orders for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- Order Items:
-- Users can read own order items (via order ownership)
create policy "Users can see own order items" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);
-- Admins can see all
create policy "Admins can see all order items" on order_items for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);
