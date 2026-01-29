create table if not exists portfolio_asset_prices (
    id uuid primary key default gen_random_uuid(),
    asset_id uuid not null references portfolio_assets(id) on delete cascade,
    price_date date not null,
    ticker text not null,
    open numeric,
    high numeric,
    low numeric,
    close numeric,
    volume numeric,
    currency text,
    shares numeric not null,
    value numeric,
    created_at timestamptz not null default now(),
    unique (asset_id, price_date)
);

create index if not exists idx_portfolio_asset_prices_date
    on portfolio_asset_prices (price_date);

create index if not exists idx_portfolio_asset_prices_asset
    on portfolio_asset_prices (asset_id);
