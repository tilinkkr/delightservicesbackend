-- NUCLEAR OPTION: Clean slate
drop table if exists public.cart_items cascade;
drop table if exists public.carts cascade;
drop table if exists public.orders cascade;

-- CARTS
create table public.carts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.carts enable row level security;

create policy "Users see own carts"
on public.carts for select using (auth.uid() = user_id);

create policy "Users create own carts"
on public.carts for insert with check (auth.uid() = user_id);

-- CART ITEMS
create table public.cart_items (
  id bigserial primary key,
  cart_id bigint references public.carts(id) on delete cascade,
  product_id bigint references public.products(id),
  quantity int default 1,
  created_at timestamptz default now()
);

alter table public.cart_items enable row level security;

create policy "Users manage own cart items"
on public.cart_items for all using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id and carts.user_id = auth.uid()
  )
);

-- ORDERS
create table public.orders (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  product_id bigint references public.products(id),
  product_name text,
  product_price numeric(10,2),
  status text default 'paid',
  payment_method text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Users see own orders"
on public.orders for select using (auth.uid() = user_id);

create policy "Users create own orders"
on public.orders for insert with check (auth.uid() = user_id);
