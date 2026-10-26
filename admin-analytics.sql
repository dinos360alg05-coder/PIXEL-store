-- Run once in Supabase SQL Editor to enable accurate sales and live inventory stats.
alter table public.products
  add column if not exists units_sold integer not null default 0 check (units_sold >= 0);

create or replace function public.record_product_sale(p_product_id uuid, p_quantity integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_store_admin() then
    raise exception 'Only a store admin can record a sale.' using errcode = '42501';
  end if;
  if p_quantity is null or p_quantity < 1 then
    raise exception 'Sale quantity must be a positive integer.' using errcode = '22023';
  end if;

  update public.products
  set stock = stock - p_quantity,
      units_sold = units_sold + p_quantity
  where id = p_product_id and stock >= p_quantity;

  if not found then
    if exists (select 1 from public.products where id = p_product_id) then
      raise exception 'Not enough stock for this sale.' using errcode = '22023';
    end if;
    raise exception 'Product not found.' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.record_product_sale(uuid, integer) from public, anon;
grant execute on function public.record_product_sale(uuid, integer) to authenticated;
