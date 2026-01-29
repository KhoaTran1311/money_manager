import math
import os
from datetime import date
from decimal import Decimal, InvalidOperation

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from supabase import create_client, Client
import yfinance as yf


load_dotenv()

app = Flask(__name__)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)


def _parse_date(value, field_name):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"Invalid date for {field_name}") from exc


def _parse_decimal(value, field_name):
    if value is None or value == "":
        return None
    try:
        return float(Decimal(str(value)))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError(f"Invalid number for {field_name}") from exc


def _handle_supabase_error(result):
    if getattr(result, "error", None):
        message = getattr(result.error, "message", None) or "Supabase error"
        return jsonify({"error": message}), 400
    return None


def _normalize_number(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return value


def _to_float(value):
    if value is None:
        return None
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    if math.isnan(number) or math.isinf(number):
        return None
    return number


@app.route("/health/")
@app.route("/api/health/")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/short-term/transactions/", methods=["GET", "POST"])
def short_term_transactions():
    if request.method == "GET":
        result = (
            supabase.table("spending_transactions")
            .select("*")
            .order("date", desc=True)
            .order("id", desc=True)
            .execute()
        )
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        return jsonify(
            [
                {
                    "id": item.get("id"),
                    "date": item.get("date"),
                    "category": item.get("category"),
                    "amount": _normalize_number(item.get("amount")),
                    "description": item.get("description") or "",
                }
                for item in (result.data or [])
            ]
        )

    payload = request.get_json(silent=True) or {}
    try:
        category = (payload.get("category") or "").strip()
        if not category:
            return jsonify({"error": "Category is required"}), 400
        record = {
            "date": (_parse_date(payload.get("date"), "date") or date.today()).isoformat(),
            "category": category,
            "amount": _parse_decimal(payload.get("amount"), "amount"),
            "description": (payload.get("description") or "").strip(),
        }
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = supabase.table("spending_transactions").insert(record).execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    item = (result.data or [{}])[0]
    return (
        jsonify(
            {
                "id": item.get("id"),
                "date": item.get("date"),
                "category": item.get("category"),
                "amount": _normalize_number(item.get("amount")),
                "description": item.get("description") or "",
            }
        ),
        201,
    )


@app.route("/api/short-term/subscriptions/", methods=["GET", "POST"])
def short_term_subscriptions():
    if request.method == "GET":
        result = (
            supabase.table("subscriptions")
            .select("*")
            .order("name", desc=False)
            .execute()
        )
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        return jsonify(
            [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "category": item.get("category"),
                    "amount": _normalize_number(item.get("amount")),
                    "billingCycle": item.get("billing_cycle"),
                    "nextBilling": item.get("next_billing"),
                    "icon": item.get("icon") or "",
                    "status": item.get("status") or "active",
                }
                for item in (result.data or [])
            ]
        )

    payload = request.get_json(silent=True) or {}
    try:
        record = {
            "name": (payload.get("name") or "").strip(),
            "category": (payload.get("category") or "").strip(),
            "amount": _parse_decimal(payload.get("amount"), "amount"),
            "billing_cycle": payload.get("billingCycle") or "monthly",
            "next_billing": _parse_date(payload.get("nextBilling"), "nextBilling"),
            "icon": (payload.get("icon") or "").strip(),
            "status": (payload.get("status") or "active").strip() or "active",
        }
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = supabase.table("subscriptions").insert(record).execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    item = (result.data or [{}])[0]
    return (
        jsonify(
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "category": item.get("category"),
                "amount": _normalize_number(item.get("amount")),
                "billingCycle": item.get("billing_cycle"),
                "nextBilling": item.get("next_billing"),
                "icon": item.get("icon") or "",
                "status": item.get("status") or "active",
            }
        ),
        201,
    )


@app.route("/api/short-term/accounts/", methods=["GET", "POST"])
def short_term_accounts():
    if request.method == "GET":
        result = (
            supabase.table("account_balances")
            .select("*")
            .order("name", desc=False)
            .execute()
        )
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        return jsonify(
            [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "institution": item.get("institution"),
                    "type": item.get("type"),
                    "balance": _normalize_number(item.get("balance")),
                    "lastUpdated": item.get("last_updated"),
                    "accountNumber": item.get("account_number"),
                    "apy": _normalize_number(item.get("apy")),
                    "icon": item.get("icon") or "",
                }
                for item in (result.data or [])
            ]
        )

    payload = request.get_json(silent=True) or {}
    try:
        record = {
            "name": (payload.get("name") or "").strip(),
            "institution": (payload.get("institution") or "").strip(),
            "type": payload.get("type") or "checking",
            "balance": _parse_decimal(payload.get("balance"), "balance"),
            "last_updated": _parse_date(payload.get("lastUpdated"), "lastUpdated"),
            "account_number": (payload.get("accountNumber") or "").strip(),
            "apy": _parse_decimal(payload.get("apy"), "apy"),
            "icon": (payload.get("icon") or "").strip(),
        }
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = supabase.table("account_balances").insert(record).execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    item = (result.data or [{}])[0]
    return (
        jsonify(
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "institution": item.get("institution"),
                "type": item.get("type"),
                "balance": _normalize_number(item.get("balance")),
                "lastUpdated": item.get("last_updated"),
                "accountNumber": item.get("account_number"),
                "apy": _normalize_number(item.get("apy")),
                "icon": item.get("icon") or "",
            }
        ),
        201,
    )


@app.route("/api/market/quote/")
def market_quote():
    symbols = (request.args.get("symbols") or "").strip()
    if not symbols:
        return jsonify({"error": "symbols query parameter is required"}), 400

    symbol = symbols.split(",")[0].strip()
    if not symbol:
        return jsonify({"error": "symbols query parameter is required"}), 400

    try:
        ticker = yf.Ticker(symbol)
        info = ticker.get_info() or {}
    except Exception:
        info = {}

    if not info:
        return jsonify({"error": "Quote lookup failed"}), 502

    return jsonify(
        {
            "symbol": info.get("symbol") or symbol.upper(),
            "shortName": info.get("shortName") or info.get("longName"),
            "longName": info.get("longName") or info.get("shortName"),
            "quoteType": info.get("quoteType") or info.get("instrumentType"),
            "regularMarketPrice": _normalize_number(info.get("regularMarketPrice")),
            "currency": info.get("currency"),
            "sector": info.get("sector"),
            "industry": info.get("industry"),
        }
    )

@app.route("/api/market/search/")
def market_search():
    query = (request.args.get("query") or "").strip()
    if not query:
        return jsonify({"error": "query parameter is required"}), 400

    try:
        search = yf.Search(query)
        quotes = getattr(search, "quotes", None) or []
    except Exception:
        quotes = []

    results = []
    for quote in quotes[:10]:
        symbol = quote.get("symbol") or quote.get("ticker")
        name = (
            quote.get("shortname")
            or quote.get("shortName")
            or quote.get("longname")
            or quote.get("longName")
        )
        exchange = quote.get("exchDisp") or quote.get("exchange")
        results.append(
            {
                "symbol": symbol,
                "name": name,
                "exchange": exchange,
                "quoteType": quote.get("quoteType") or quote.get("typeDisp"),
            }
        )

    return jsonify(results)

def _serialize_asset(item):
    return {
        "id": item.get("id"),
        "ticker": item.get("ticker"),
        "name": item.get("name"),
        "type": item.get("security_type"),
        "boughtPrice": _normalize_number(item.get("bought_price")),
        "shares": _normalize_number(item.get("shares")),
        "value": _normalize_number(item.get("value")),
        "broker": item.get("broker"),
        "sector": item.get("sector") or "",
        "industry": item.get("industry") or "",
        "countries": item.get("countries") or "",
        "currency": item.get("currency") or "",
    }


def _parse_query_date(field_name):
    value = (request.args.get(field_name) or "").strip()
    if not value:
        return None
    return _parse_date(value, field_name)


def _fetch_latest_market_data(symbol):
    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="5d", interval="1d")
    except Exception:
        return None

    if history is None or history.empty:
        return None

    latest = history.tail(1).iloc[0]
    timestamp = latest.name
    price_date = timestamp.date() if hasattr(timestamp, "date") else None
    if price_date is None:
        return None

    try:
        info = ticker.get_info() or {}
        currency = info.get("currency")
    except Exception:
        currency = None

    return {
        "price_date": price_date,
        "open": _to_float(latest.get("Open")),
        "high": _to_float(latest.get("High")),
        "low": _to_float(latest.get("Low")),
        "close": _to_float(latest.get("Close")),
        "volume": _to_float(latest.get("Volume")),
        "currency": currency,
    }


@app.route("/api/long-term/prices/snapshot/", methods=["POST"])
def long_term_price_snapshot():
    assets_result = (
        supabase.table("portfolio_assets")
        .select("id,ticker,shares,currency")
        .order("created_at", desc=True)
        .execute()
    )
    error_response = _handle_supabase_error(assets_result)
    if error_response:
        return error_response

    assets = assets_result.data or []
    if not assets:
        return jsonify({"updated": 0, "skipped": 0, "message": "No assets found."})

    market_cache = {}
    records = []
    skipped = 0

    for asset in assets:
        symbol = (asset.get("ticker") or "").strip().upper()
        shares = _to_float(asset.get("shares"))
        if not symbol or shares is None:
            skipped += 1
            continue

        if symbol not in market_cache:
            market_cache[symbol] = _fetch_latest_market_data(symbol)
        market = market_cache.get(symbol)
        if not market or market.get("close") is None:
            skipped += 1
            continue

        value = market["close"] * shares if market.get("close") is not None else None
        record = {
            "asset_id": asset.get("id"),
            "price_date": market["price_date"].isoformat(),
            "ticker": symbol,
            "open": market.get("open"),
            "high": market.get("high"),
            "low": market.get("low"),
            "close": market.get("close"),
            "volume": market.get("volume"),
            "currency": market.get("currency") or asset.get("currency"),
            "shares": shares,
            "value": value,
        }
        records.append(record)

    if not records:
        return jsonify({"updated": 0, "skipped": skipped, "message": "No prices saved."})

    insert_result = (
        supabase.table("portfolio_asset_prices")
        .upsert(records, on_conflict="asset_id,price_date")
        .execute()
    )
    error_response = _handle_supabase_error(insert_result)
    if error_response:
        return error_response

    snapshot_dates = sorted({item["price_date"] for item in records})
    return jsonify(
        {
            "updated": len(records),
            "skipped": skipped,
            "dates": snapshot_dates,
        }
    )


@app.route("/api/long-term/prices/portfolio/")
def long_term_portfolio_prices():
    try:
        start_date = _parse_query_date("start")
        end_date = _parse_query_date("end")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    query = supabase.table("portfolio_asset_prices").select("price_date,value")
    if start_date:
        query = query.gte("price_date", start_date.isoformat())
    if end_date:
        query = query.lte("price_date", end_date.isoformat())
    result = query.execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    totals = {}
    for item in (result.data or []):
        price_date = item.get("price_date")
        value = _to_float(item.get("value")) or 0
        totals[price_date] = totals.get(price_date, 0) + value

    payload = [
        {"date": price_date, "value": total}
        for price_date, total in sorted(totals.items())
    ]
    return jsonify(payload)


@app.route("/api/long-term/prices/assets/<asset_id>/")
def long_term_asset_prices(asset_id):
    try:
        start_date = _parse_query_date("start")
        end_date = _parse_query_date("end")
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    query = (
        supabase.table("portfolio_asset_prices")
        .select("price_date,close,value")
        .eq("asset_id", asset_id)
    )
    if start_date:
        query = query.gte("price_date", start_date.isoformat())
    if end_date:
        query = query.lte("price_date", end_date.isoformat())
    result = query.order("price_date", desc=False).execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    payload = [
        {
            "date": item.get("price_date"),
            "price": _to_float(item.get("close")),
            "value": _to_float(item.get("value")),
        }
        for item in (result.data or [])
    ]
    return jsonify(payload)


@app.route("/api/long-term/assets/", methods=["GET", "POST"])
def long_term_assets():
    if request.method == "GET":
        result = (
            supabase.table("portfolio_assets")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        return jsonify([_serialize_asset(item) for item in (result.data or [])])

    payload = request.get_json(silent=True) or {}
    try:
        ticker = (payload.get("ticker") or "").strip().upper()
        name = (payload.get("name") or "").strip()
        security_type = (payload.get("type") or "").strip()
        broker = (payload.get("broker") or "").strip()
        bought_price = _parse_decimal(payload.get("boughtPrice"), "boughtPrice")
        shares = _parse_decimal(payload.get("shares"), "shares")
        if not ticker or not name or not security_type or not broker:
            return jsonify({"error": "Missing required asset fields"}), 400
        if bought_price is None or shares is None:
            return jsonify({"error": "Invalid price or shares"}), 400
        value = bought_price * shares
        record = {
            "ticker": ticker,
            "name": name,
            "security_type": security_type,
            "bought_price": bought_price,
            "shares": shares,
            "value": value,
            "broker": broker,
            "sector": (payload.get("sector") or "").strip(),
            "industry": (payload.get("industry") or "").strip(),
            "countries": (payload.get("countries") or "").strip(),
            "currency": (payload.get("currency") or "").strip(),
        }
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = supabase.table("portfolio_assets").insert(record).execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response
    item = (result.data or [{}])[0]
    return jsonify(_serialize_asset(item)), 201


@app.route("/api/long-term/assets/<asset_id>/", methods=["PUT", "DELETE"])
def long_term_asset_detail(asset_id):
    if request.method == "DELETE":
        result = supabase.table("portfolio_assets").delete().eq("id", asset_id).execute()
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        return jsonify({"status": "deleted"})

    payload = request.get_json(silent=True) or {}
    try:
        ticker = (payload.get("ticker") or "").strip().upper()
        name = (payload.get("name") or "").strip()
        security_type = (payload.get("type") or "").strip()
        broker = (payload.get("broker") or "").strip()
        bought_price = _parse_decimal(payload.get("boughtPrice"), "boughtPrice")
        shares = _parse_decimal(payload.get("shares"), "shares")
        if not ticker or not name or not security_type or not broker:
            return jsonify({"error": "Missing required asset fields"}), 400
        if bought_price is None or shares is None:
            return jsonify({"error": "Invalid price or shares"}), 400
        value = bought_price * shares
        record = {
            "ticker": ticker,
            "name": name,
            "security_type": security_type,
            "bought_price": bought_price,
            "shares": shares,
            "value": value,
            "broker": broker,
            "sector": (payload.get("sector") or "").strip(),
            "industry": (payload.get("industry") or "").strip(),
            "countries": (payload.get("countries") or "").strip(),
            "currency": (payload.get("currency") or "").strip(),
        }
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = (
        supabase.table("portfolio_assets")
        .update(record)
        .eq("id", asset_id)
        .execute()
    )
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response
    item = (result.data or [{}])[0]
    return jsonify(_serialize_asset(item))


@app.route("/api/short-term/credit-cards/", methods=["GET", "POST"])
def short_term_credit_cards():
    if request.method == "GET":
        result = (
            supabase.table("credit_cards")
            .select("*")
            .order("name", desc=False)
            .execute()
        )
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        return jsonify(
            [
                {
                    "id": item.get("id"),
                    "name": item.get("name"),
                    "institution": item.get("institution"),
                    "type": item.get("type"),
                    "lastFour": item.get("last_four"),
                    "currentBalance": _normalize_number(item.get("current_balance")),
                    "creditLimit": _normalize_number(item.get("credit_limit")),
                    "pointsBalance": item.get("points_balance"),
                    "pointsName": item.get("points_name"),
                    "pointsValue": _normalize_number(item.get("points_value")),
                    "cashbackRate": _normalize_number(item.get("cashback_rate")),
                    "rewardsThisMonth": _normalize_number(item.get("rewards_this_month")),
                    "cashbackEarned": _normalize_number(item.get("cashback_earned")),
                    "icon": item.get("icon") or "",
                    "color": item.get("color") or "",
                }
                for item in (result.data or [])
            ]
        )

    payload = request.get_json(silent=True) or {}
    try:
        record = {
            "name": (payload.get("name") or "").strip(),
            "institution": (payload.get("institution") or "").strip(),
            "type": (payload.get("type") or "").strip(),
            "last_four": (payload.get("lastFour") or "").strip(),
            "current_balance": _parse_decimal(payload.get("currentBalance"), "currentBalance")
            or 0,
            "credit_limit": _parse_decimal(payload.get("creditLimit"), "creditLimit"),
            "points_balance": payload.get("pointsBalance"),
            "points_name": (payload.get("pointsName") or "").strip(),
            "points_value": _parse_decimal(payload.get("pointsValue"), "pointsValue"),
            "cashback_rate": _parse_decimal(payload.get("cashbackRate"), "cashbackRate"),
            "rewards_this_month": _parse_decimal(
                payload.get("rewardsThisMonth"), "rewardsThisMonth"
            ),
            "cashback_earned": _parse_decimal(payload.get("cashbackEarned"), "cashbackEarned"),
            "icon": (payload.get("icon") or "").strip(),
            "color": (payload.get("color") or "").strip(),
        }
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    result = supabase.table("credit_cards").insert(record).execute()
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    item = (result.data or [{}])[0]
    return (
        jsonify(
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "institution": item.get("institution"),
                "type": item.get("type"),
                "lastFour": item.get("last_four"),
                "currentBalance": _normalize_number(item.get("current_balance")),
                "creditLimit": _normalize_number(item.get("credit_limit")),
                "pointsBalance": item.get("points_balance"),
                "pointsName": item.get("points_name"),
                "pointsValue": _normalize_number(item.get("points_value")),
                "cashbackRate": _normalize_number(item.get("cashback_rate")),
                "rewardsThisMonth": _normalize_number(item.get("rewards_this_month")),
                "cashbackEarned": _normalize_number(item.get("cashback_earned")),
                "icon": item.get("icon") or "",
                "color": item.get("color") or "",
            }
        ),
        201,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

