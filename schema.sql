-- Pixel Store schema. Apply as Supabase SQL Editor owner. Public clients use the anon key.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), slug text unique not null, name_en text not null, name_ar text not null, created_at timestamptz not null default now());
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(), slug text unique not null, category_id uuid references public.categories(id) on delete set null,
 subcategory text, brand text, name_ar text not null, name_en text not null, description_ar text not null default '', description_en text not null default '',
 price numeric(12,2) not null check(price>=0), old_price numeric(12,2) check(old_price is null or old_price>=0), stock integer not null default 0 check(stock>=0), rating numeric(2,1) not null default 0,
 badges text[] not null default '{}', images text[] not null default '{}', variants jsonb not null default '[]', specs jsonb not null default '{}', tags text[] not null default '{}', featured boolean not null default false, is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.pc_configs (id uuid primary key default gen_random_uuid(), tier text not null, name text not null, components jsonb not null default '{}', use_case text not null default '', price numeric(12,2) not null check(price>=0), options jsonb not null default '{}', is_active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.site_settings (key text primary key, value jsonb not null default '{}', updated_at timestamptz not null default now());
create unique index if not exists pc_configs_tier_name_unique on public.pc_configs(tier,name);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists products_price_idx on public.products(price);
create index if not exists products_search_idx on public.products using gin(to_tsvector('simple',coalesce(name_en,'')||' '||coalesce(name_ar,'')||' '||coalesce(brand,'')||' '||coalesce(description_en,'')));
create index if not exists pc_configs_active_idx on public.pc_configs(is_active,tier);
alter table public.admin_users enable row level security; alter table public.categories enable row level security; alter table public.products enable row level security; alter table public.pc_configs enable row level security; alter table public.site_settings enable row level security;
create or replace function public.is_store_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
drop policy if exists admin_self_read on public.admin_users; create policy admin_self_read on public.admin_users for select to authenticated using(user_id=auth.uid());
drop policy if exists categories_public_read on public.categories; create policy categories_public_read on public.categories for select to anon,authenticated using(true);
drop policy if exists categories_admin_write on public.categories; create policy categories_admin_write on public.categories for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
drop policy if exists products_public_active_read on public.products; create policy products_public_active_read on public.products for select to anon,authenticated using(is_active=true or public.is_store_admin());
drop policy if exists products_admin_write on public.products; create policy products_admin_write on public.products for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
drop policy if exists configs_public_read on public.pc_configs; create policy configs_public_read on public.pc_configs for select to anon,authenticated using(is_active=true or public.is_store_admin());
drop policy if exists configs_admin_write on public.pc_configs; create policy configs_admin_write on public.pc_configs for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
drop policy if exists settings_public_read on public.site_settings; create policy settings_public_read on public.site_settings for select to anon,authenticated using(true);
drop policy if exists settings_admin_write on public.site_settings; create policy settings_admin_write on public.site_settings for all to authenticated using(public.is_store_admin()) with check(public.is_store_admin());
-- Storage: create public bucket once; object listing is public, writes require allow-listed admin.
insert into storage.buckets(id,name,public) values('product-images','product-images',true) on conflict(id) do update set public=true;
drop policy if exists product_images_public_read on storage.objects; create policy product_images_public_read on storage.objects for select to anon,authenticated using(bucket_id='product-images');
drop policy if exists product_images_admin_insert on storage.objects; create policy product_images_admin_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_store_admin());
drop policy if exists product_images_admin_update on storage.objects; create policy product_images_admin_update on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_store_admin()) with check(bucket_id='product-images' and public.is_store_admin());
drop policy if exists product_images_admin_delete on storage.objects; create policy product_images_admin_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_store_admin());

-- Sales analytics. Keep this in sync with admin-analytics.sql.
alter table public.products add column if not exists units_sold integer not null default 0 check (units_sold >= 0);
create or replace function public.record_product_sale(p_product_id uuid, p_quantity integer)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_store_admin() then raise exception 'Only a store admin can record a sale.' using errcode='42501'; end if;
 if p_quantity is null or p_quantity<1 then raise exception 'Sale quantity must be a positive integer.' using errcode='22023'; end if;
 update public.products set stock=stock-p_quantity,units_sold=units_sold+p_quantity where id=p_product_id and stock>=p_quantity;
 if not found then
  if exists(select 1 from public.products where id=p_product_id) then raise exception 'Not enough stock for this sale.' using errcode='22023'; end if;
  raise exception 'Product not found.' using errcode='P0002';
 end if;
end; $$;
revoke all on function public.record_product_sale(uuid,integer) from public,anon;
grant execute on function public.record_product_sale(uuid,integer) to authenticated;
