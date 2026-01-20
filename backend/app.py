# import os
# from datetime import date
# from decimal import Decimal, InvalidOperation

# from dotenv import load_dotenv
# from flask import Flask, jsonify, request
# from supabase import create_client, Client


# load_dotenv()

# app = Flask(__name__)

# supabase: Client = create_client(
#     os.environ.get("SUPABASE_URL"),
#     os.environ.get("SUPABASE_KEY")
# )


# def _parse_date(value, field_name):
#     if not value:
#         return None
#     try:
#         return date.fromisoformat(value)
#     except ValueError as exc:
#         raise ValueError(f"Invalid date for {field_name}") from exc


# def _parse_decimal(value, field_name):
#     if value is None or value == "":
#         return None
#     try:
#         return float(Decimal(str(value)))
#     except (InvalidOperation, ValueError) as exc:
#         raise ValueError(f"Invalid number for {field_name}") from exc


# def _handle_supabase_error(result):
#     if getattr(result, "error", None):
#         message = getattr(result.error, "message", None) or "Supabase error"
#         return jsonify({"error": message}), 400
#     return None


# def _normalize_number(value):
#     if value is None:
#         return None
#     try:
#         return float(value)
#     except (TypeError, ValueError):
#         return value


# @app.route("/health/")
# @app.route("/api/health/")
# def health():
#     return jsonify({"status": "ok"})


# @app.route("/api/short-term/transactions/", methods=["GET", "POST"])
# def short_term_transactions():
#     if request.method == "GET":
#         result = (
#             supabase.table("spending_transactions")
#             .select("*")
#             .order("date", desc=True)
#             .order("id", desc=True)
#             .execute()
#         )
#         error_response = _handle_supabase_error(result)
#         if error_response:
#             return error_response
#         return jsonify(
#             [
#                 {
#                     "id": item.get("id"),
#                     "date": item.get("date"),
#                     "category": item.get("category"),
#                     "amount": _normalize_number(item.get("amount")),
#                     "description": item.get("description") or "",
#                 }
#                 for item in (result.data or [])
#             ]
#         )

#     payload = request.get_json(silent=True) or {}
#     try:
#         category = (payload.get("category") or "").strip()
#         if not category:
#             return jsonify({"error": "Category is required"}), 400
#         record = {
#             "date": (_parse_date(payload.get("date"), "date") or date.today()).isoformat(),
#             "category": category,
#             "amount": _parse_decimal(payload.get("amount"), "amount"),
#             "description": (payload.get("description") or "").strip(),
#         }
#     except ValueError as exc:
#         return jsonify({"error": str(exc)}), 400

#     result = supabase.table("spending_transactions").insert(record).execute()
#     error_response = _handle_supabase_error(result)
#     if error_response:
#         return error_response

#     item = (result.data or [{}])[0]
#     return (
#         jsonify(
#             {
#                 "id": item.get("id"),
#                 "date": item.get("date"),
#                 "category": item.get("category"),
#                 "amount": _normalize_number(item.get("amount")),
#                 "description": item.get("description") or "",
#             }
#         ),
#         201,
#     )


# @app.route("/api/short-term/subscriptions/", methods=["GET", "POST"])
# def short_term_subscriptions():
#     if request.method == "GET":
#         result = (
#             supabase.table("subscriptions")
#             .select("*")
#             .order("name", desc=False)
#             .execute()
#         )
#         error_response = _handle_supabase_error(result)
#         if error_response:
#             return error_response
#         return jsonify(
#             [
#                 {
#                     "id": item.get("id"),
#                     "name": item.get("name"),
#                     "category": item.get("category"),
#                     "amount": _normalize_number(item.get("amount")),
#                     "billingCycle": item.get("billing_cycle"),
#                     "nextBilling": item.get("next_billing"),
#                     "icon": item.get("icon") or "",
#                     "status": item.get("status") or "active",
#                 }
#                 for item in (result.data or [])
#             ]
#         )

#     payload = request.get_json(silent=True) or {}
#     try:
#         record = {
#             "name": (payload.get("name") or "").strip(),
#             "category": (payload.get("category") or "").strip(),
#             "amount": _parse_decimal(payload.get("amount"), "amount"),
#             "billing_cycle": payload.get("billingCycle") or "monthly",
#             "next_billing": _parse_date(payload.get("nextBilling"), "nextBilling"),
#             "icon": (payload.get("icon") or "").strip(),
#             "status": (payload.get("status") or "active").strip() or "active",
#         }
#     except ValueError as exc:
#         return jsonify({"error": str(exc)}), 400

#     result = supabase.table("subscriptions").insert(record).execute()
#     error_response = _handle_supabase_error(result)
#     if error_response:
#         return error_response

#     item = (result.data or [{}])[0]
#     return (
#         jsonify(
#             {
#                 "id": item.get("id"),
#                 "name": item.get("name"),
#                 "category": item.get("category"),
#                 "amount": _normalize_number(item.get("amount")),
#                 "billingCycle": item.get("billing_cycle"),
#                 "nextBilling": item.get("next_billing"),
#                 "icon": item.get("icon") or "",
#                 "status": item.get("status") or "active",
#             }
#         ),
#         201,
#     )


# @app.route("/api/short-term/accounts/", methods=["GET", "POST"])
# def short_term_accounts():
#     if request.method == "GET":
#         result = (
#             supabase.table("account_balances")
#             .select("*")
#             .order("name", desc=False)
#             .execute()
#         )
#         error_response = _handle_supabase_error(result)
#         if error_response:
#             return error_response
#         return jsonify(
#             [
#                 {
#                     "id": item.get("id"),
#                     "name": item.get("name"),
#                     "institution": item.get("institution"),
#                     "type": item.get("type"),
#                     "balance": _normalize_number(item.get("balance")),
#                     "lastUpdated": item.get("last_updated"),
#                     "accountNumber": item.get("account_number"),
#                     "apy": _normalize_number(item.get("apy")),
#                     "icon": item.get("icon") or "",
#                 }
#                 for item in (result.data or [])
#             ]
#         )

#     payload = request.get_json(silent=True) or {}
#     try:
#         record = {
#             "name": (payload.get("name") or "").strip(),
#             "institution": (payload.get("institution") or "").strip(),
#             "type": payload.get("type") or "checking",
#             "balance": _parse_decimal(payload.get("balance"), "balance"),
#             "last_updated": _parse_date(payload.get("lastUpdated"), "lastUpdated"),
#             "account_number": (payload.get("accountNumber") or "").strip(),
#             "apy": _parse_decimal(payload.get("apy"), "apy"),
#             "icon": (payload.get("icon") or "").strip(),
#         }
#     except ValueError as exc:
#         return jsonify({"error": str(exc)}), 400

#     result = supabase.table("account_balances").insert(record).execute()
#     error_response = _handle_supabase_error(result)
#     if error_response:
#         return error_response

#     item = (result.data or [{}])[0]
#     return (
#         jsonify(
#             {
#                 "id": item.get("id"),
#                 "name": item.get("name"),
#                 "institution": item.get("institution"),
#                 "type": item.get("type"),
#                 "balance": _normalize_number(item.get("balance")),
#                 "lastUpdated": item.get("last_updated"),
#                 "accountNumber": item.get("account_number"),
#                 "apy": _normalize_number(item.get("apy")),
#                 "icon": item.get("icon") or "",
#             }
#         ),
#         201,
#     )


# @app.route("/api/short-term/credit-cards/", methods=["GET", "POST"])
# def short_term_credit_cards():
#     if request.method == "GET":
#         result = (
#             supabase.table("credit_cards")
#             .select("*")
#             .order("name", desc=False)
#             .execute()
#         )
#         error_response = _handle_supabase_error(result)
#         if error_response:
#             return error_response
#         return jsonify(
#             [
#                 {
#                     "id": item.get("id"),
#                     "name": item.get("name"),
#                     "institution": item.get("institution"),
#                     "type": item.get("type"),
#                     "lastFour": item.get("last_four"),
#                     "currentBalance": _normalize_number(item.get("current_balance")),
#                     "creditLimit": _normalize_number(item.get("credit_limit")),
#                     "pointsBalance": item.get("points_balance"),
#                     "pointsName": item.get("points_name"),
#                     "pointsValue": _normalize_number(item.get("points_value")),
#                     "cashbackRate": _normalize_number(item.get("cashback_rate")),
#                     "rewardsThisMonth": _normalize_number(item.get("rewards_this_month")),
#                     "cashbackEarned": _normalize_number(item.get("cashback_earned")),
#                     "icon": item.get("icon") or "",
#                     "color": item.get("color") or "",
#                 }
#                 for item in (result.data or [])
#             ]
#         )

#     payload = request.get_json(silent=True) or {}
#     try:
#         record = {
#             "name": (payload.get("name") or "").strip(),
#             "institution": (payload.get("institution") or "").strip(),
#             "type": (payload.get("type") or "").strip(),
#             "last_four": (payload.get("lastFour") or "").strip(),
#             "current_balance": _parse_decimal(payload.get("currentBalance"), "currentBalance")
#             or 0,
#             "credit_limit": _parse_decimal(payload.get("creditLimit"), "creditLimit"),
#             "points_balance": payload.get("pointsBalance"),
#             "points_name": (payload.get("pointsName") or "").strip(),
#             "points_value": _parse_decimal(payload.get("pointsValue"), "pointsValue"),
#             "cashback_rate": _parse_decimal(payload.get("cashbackRate"), "cashbackRate"),
#             "rewards_this_month": _parse_decimal(
#                 payload.get("rewardsThisMonth"), "rewardsThisMonth"
#             ),
#             "cashback_earned": _parse_decimal(payload.get("cashbackEarned"), "cashbackEarned"),
#             "icon": (payload.get("icon") or "").strip(),
#             "color": (payload.get("color") or "").strip(),
#         }
#     except ValueError as exc:
#         return jsonify({"error": str(exc)}), 400

#     result = supabase.table("credit_cards").insert(record).execute()
#     error_response = _handle_supabase_error(result)
#     if error_response:
#         return error_response

#     item = (result.data or [{}])[0]
#     return (
#         jsonify(
#             {
#                 "id": item.get("id"),
#                 "name": item.get("name"),
#                 "institution": item.get("institution"),
#                 "type": item.get("type"),
#                 "lastFour": item.get("last_four"),
#                 "currentBalance": _normalize_number(item.get("current_balance")),
#                 "creditLimit": _normalize_number(item.get("credit_limit")),
#                 "pointsBalance": item.get("points_balance"),
#                 "pointsName": item.get("points_name"),
#                 "pointsValue": _normalize_number(item.get("points_value")),
#                 "cashbackRate": _normalize_number(item.get("cashback_rate")),
#                 "rewardsThisMonth": _normalize_number(item.get("rewards_this_month")),
#                 "cashbackEarned": _normalize_number(item.get("cashback_earned")),
#                 "icon": item.get("icon") or "",
#                 "color": item.get("color") or "",
#             }
#         ),
#         201,
#     )


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8000, debug=True)
import os
from datetime import date
from decimal import Decimal, InvalidOperation

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from supabase import create_client, Client


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


@app.route("/health/")
@app.route("/api/health/")
def health():
    return jsonify({"status": "ok"})


@app.route("/api/short-term/recurring/generate", methods=["POST"])
def generate_recurring_transactions():
    """Generate transactions from recurring templates for a given date range"""
    from datetime import timedelta
    
    payload = request.get_json(silent=True) or {}
    try:
        start_date = _parse_date(payload.get("startDate"), "startDate") or date.today()
        end_date = _parse_date(payload.get("endDate"), "endDate") or (date.today() + timedelta(days=30))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    
    # Get all recurring transaction templates
    result = (
        supabase.table("spending_transactions")
        .select("*")
        .eq("is_recurring", True)
        .execute()
    )
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response
    
    templates = result.data or []
    generated_transactions = []
    
    for template in templates:
        template_start = _parse_date(template.get("recurrence_start_date"), "start") or start_date
        template_end = _parse_date(template.get("recurrence_end_date"), "end")
        frequency = template.get("recurrence_frequency")
        recurrence_day = template.get("recurrence_day")
        
        # Skip if template hasn't started yet
        if template_start > end_date:
            continue
        
        # Skip if template has ended
        if template_end and template_end < start_date:
            continue
        
        # Generate occurrences based on frequency
        current_date = max(start_date, template_start)
        
        while current_date <= end_date:
            # Check if we've passed the template end date
            if template_end and current_date > template_end:
                break
            
            # Check if this transaction already exists
            existing = (
                supabase.table("spending_transactions")
                .select("id")
                .eq("parent_transaction_id", template["id"])
                .eq("date", current_date.isoformat())
                .execute()
            )
            
            if not existing.data:
                # Create the transaction
                new_transaction = {
                    "date": current_date.isoformat(),
                    "category": template["category"],
                    "amount": template["amount"],
                    "description": template["description"],
                    "parent_transaction_id": template["id"],
                    "is_recurring": False,
                }
                
                insert_result = supabase.table("spending_transactions").insert(new_transaction).execute()
                if not getattr(insert_result, "error", None) and insert_result.data:
                    generated_transactions.append(insert_result.data[0])
            
            # Calculate next occurrence
            if frequency == "daily":
                current_date += timedelta(days=1)
            elif frequency == "weekly":
                current_date += timedelta(days=7)
            elif frequency == "monthly":
                # Move to next month, same day
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
                # Handle day overflow (e.g., Jan 31 -> Feb 28)
                if recurrence_day:
                    try:
                        current_date = current_date.replace(day=recurrence_day)
                    except ValueError:
                        # Day doesn't exist in this month, use last day
                        current_date = current_date.replace(day=1)
                        if current_date.month == 12:
                            current_date = current_date.replace(year=current_date.year + 1, month=1, day=1)
                        else:
                            current_date = current_date.replace(month=current_date.month + 1, day=1)
                        current_date -= timedelta(days=1)
            elif frequency == "yearly":
                current_date = current_date.replace(year=current_date.year + 1)
            else:
                break
    
    return jsonify({
        "generated": len(generated_transactions),
        "transactions": [
            {
                "id": item.get("id"),
                "date": item.get("date"),
                "category": item.get("category"),
                "amount": _normalize_number(item.get("amount")),
                "description": item.get("description") or "",
                "parentTransactionId": item.get("parent_transaction_id"),
            }
            for item in generated_transactions
        ]
    }), 201


@app.route("/api/short-term/transactions/<int:transaction_id>", methods=["DELETE", "PUT"])
def short_term_transaction_delete(transaction_id):
    if request.method == "DELETE":
        result = (
            supabase.table("spending_transactions")
            .delete()
            .eq("id", transaction_id)
            .execute()
        )
        error_response = _handle_supabase_error(result)
        if error_response:
            return error_response
        
        if not result.data:
            return jsonify({"error": "Transaction not found"}), 404
        
        return jsonify({"success": True, "id": transaction_id}), 200
    
    # PUT method - update transaction
    payload = request.get_json(silent=True) or {}
    try:
        update_data = {}
        
        if "date" in payload:
            update_data["date"] = (_parse_date(payload.get("date"), "date") or date.today()).isoformat()
        
        if "category" in payload:
            category = (payload.get("category") or "").strip()
            if not category:
                return jsonify({"error": "Category cannot be empty"}), 400
            update_data["category"] = category
        
        if "amount" in payload:
            update_data["amount"] = _parse_decimal(payload.get("amount"), "amount")
        
        if "description" in payload:
            update_data["description"] = (payload.get("description") or "").strip()
        
        if "isRecurring" in payload:
            update_data["is_recurring"] = payload.get("isRecurring", False)
            
            if update_data["is_recurring"]:
                if "recurrenceFrequency" in payload:
                    update_data["recurrence_frequency"] = payload.get("recurrenceFrequency")
                if "recurrenceDay" in payload:
                    update_data["recurrence_day"] = payload.get("recurrenceDay")
                if "recurrenceStartDate" in payload:
                    update_data["recurrence_start_date"] = (_parse_date(payload.get("recurrenceStartDate"), "recurrenceStartDate") or date.today()).isoformat()
                if "recurrenceEndDate" in payload:
                    end_date = _parse_date(payload.get("recurrenceEndDate"), "recurrenceEndDate")
                    update_data["recurrence_end_date"] = end_date.isoformat() if end_date else None
            else:
                # Clear recurring fields if not recurring
                update_data["recurrence_frequency"] = None
                update_data["recurrence_day"] = None
                update_data["recurrence_start_date"] = None
                update_data["recurrence_end_date"] = None
        
        if not update_data:
            return jsonify({"error": "No fields to update"}), 400
            
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    
    result = (
        supabase.table("spending_transactions")
        .update(update_data)
        .eq("id", transaction_id)
        .execute()
    )
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response
    
    if not result.data:
        return jsonify({"error": "Transaction not found"}), 404
    
    item = (result.data or [{}])[0]
    return jsonify(
        {
            "id": item.get("id"),
            "date": item.get("date"),
            "category": item.get("category"),
            "amount": _normalize_number(item.get("amount")),
            "description": item.get("description") or "",
            "isRecurring": item.get("is_recurring") or False,
            "recurrenceFrequency": item.get("recurrence_frequency"),
            "recurrenceDay": item.get("recurrence_day"),
            "recurrenceStartDate": item.get("recurrence_start_date"),
            "recurrenceEndDate": item.get("recurrence_end_date"),
            "parentTransactionId": item.get("parent_transaction_id"),
        }
    ), 200


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
                    "isRecurring": item.get("is_recurring") or False,
                    "recurrenceFrequency": item.get("recurrence_frequency"),
                    "recurrenceDay": item.get("recurrence_day"),
                    "recurrenceStartDate": item.get("recurrence_start_date"),
                    "recurrenceEndDate": item.get("recurrence_end_date"),
                    "parentTransactionId": item.get("parent_transaction_id"),
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
            "is_recurring": payload.get("isRecurring", False),
        }
        
        # Add recurring fields if this is a recurring transaction
        if record["is_recurring"]:
            record["recurrence_frequency"] = payload.get("recurrenceFrequency")
            record["recurrence_day"] = payload.get("recurrenceDay")
            record["recurrence_start_date"] = (_parse_date(payload.get("recurrenceStartDate"), "recurrenceStartDate") or date.today()).isoformat()
            record["recurrence_end_date"] = _parse_date(payload.get("recurrenceEndDate"), "recurrenceEndDate")
            if record["recurrence_end_date"]:
                record["recurrence_end_date"] = record["recurrence_end_date"].isoformat()
        
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
                "isRecurring": item.get("is_recurring") or False,
                "recurrenceFrequency": item.get("recurrence_frequency"),
                "recurrenceDay": item.get("recurrence_day"),
                "recurrenceStartDate": item.get("recurrence_start_date"),
                "recurrenceEndDate": item.get("recurrence_end_date"),
                "parentTransactionId": item.get("parent_transaction_id"),
            }
        ),
        201,
    )


@app.route("/api/short-term/transactions/<int:transaction_id>", methods=["DELETE"])
def delete_transaction(transaction_id):
    result = (
        supabase.table("spending_transactions")
        .delete()
        .eq("id", transaction_id)
        .execute()
    )
    error_response = _handle_supabase_error(result)
    if error_response:
        return error_response

    return jsonify({"success": True}), 200


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