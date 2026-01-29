import math
import os
from datetime import date, timedelta

from dotenv import load_dotenv
from supabase import create_client
import yfinance as yf


def to_float(value):
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


def chunked(items, size):
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


def main():
    load_dotenv()

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in environment.")

    supabase = create_client(url, key)

    assets_result = (
        supabase.table("portfolio_assets")
        .select("id,ticker,shares,currency")
        .order("created_at", desc=True)
        .execute()
    )
    assets = assets_result.data or []
    if not assets:
        print("No assets found.")
        return

    start_date = date.today() - timedelta(days=730)
    records = []

    for asset in assets:
        symbol = (asset.get("ticker") or "").strip().upper()
        shares = to_float(asset.get("shares"))
        if not symbol or shares is None:
            continue

        try:
            ticker = yf.Ticker(symbol)
            history = ticker.history(period="2y", interval="1d")
        except Exception:
            history = None

        if history is None or history.empty:
            continue

        try:
            info = ticker.get_info() or {}
            currency = info.get("currency")
        except Exception:
            currency = None

        for timestamp, row in history.iterrows():
            price_date = timestamp.date() if hasattr(timestamp, "date") else None
            if price_date is None or price_date < start_date:
                continue

            close_price = to_float(row.get("Close"))
            value = close_price * shares if close_price is not None else None

            records.append(
                {
                    "asset_id": asset.get("id"),
                    "price_date": price_date.isoformat(),
                    "ticker": symbol,
                    "open": to_float(row.get("Open")),
                    "high": to_float(row.get("High")),
                    "low": to_float(row.get("Low")),
                    "close": close_price,
                    "volume": to_float(row.get("Volume")),
                    "currency": currency or asset.get("currency"),
                    "shares": shares,
                    "value": value,
                }
            )

    if not records:
        print("No historical records fetched.")
        return

    total = 0
    for batch in chunked(records, 500):
        result = (
            supabase.table("portfolio_asset_prices")
            .upsert(batch, on_conflict="asset_id,price_date")
            .execute()
        )
        if getattr(result, "error", None):
            raise RuntimeError(result.error.message)
        total += len(batch)

    print(f"Upserted {total} historical rows.")


if __name__ == "__main__":
    main()
