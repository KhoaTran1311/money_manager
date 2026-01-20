import json
from datetime import date
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import AccountBalance, CreditCard, SpendingTransaction, Subscription


def health(request):
    return JsonResponse({"status": "ok"})


def _decimal_to_float(value):
    return float(value) if value is not None else None


def _parse_date(value, field_name):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"Invalid date for {field_name}") from exc


@csrf_exempt
@require_http_methods(["GET", "POST"])
def short_term_transactions(request):
    if request.method == "GET":
        items = SpendingTransaction.objects.order_by("-date", "-id")
        return JsonResponse(
            [
                {
                    "id": item.id,
                    "date": item.date.isoformat(),
                    "category": item.category,
                    "amount": _decimal_to_float(item.amount),
                    "description": item.description,
                }
                for item in items
            ],
            safe=False,
        )

    payload = json.loads(request.body or "{}")
    try:
        category = payload.get("category", "").strip()
        if not category:
            return JsonResponse({"error": "Category is required"}, status=400)
        item = SpendingTransaction.objects.create(
            date=_parse_date(payload.get("date"), "date") or date.today(),
            category=category,
            amount=Decimal(str(payload.get("amount", "0"))),
            description=payload.get("description", "").strip(),
        )
    except (ValueError, InvalidOperation) as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    return JsonResponse(
        {
            "id": item.id,
            "date": item.date.isoformat(),
            "category": item.category,
            "amount": _decimal_to_float(item.amount),
            "description": item.description,
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def short_term_subscriptions(request):
    if request.method == "GET":
        items = Subscription.objects.order_by("name")
        return JsonResponse(
            [
                {
                    "id": item.id,
                    "name": item.name,
                    "category": item.category,
                    "amount": _decimal_to_float(item.amount),
                    "billingCycle": item.billing_cycle,
                    "nextBilling": item.next_billing.isoformat() if item.next_billing else None,
                    "icon": item.icon,
                    "status": item.status,
                }
                for item in items
            ],
            safe=False,
        )

    payload = json.loads(request.body or "{}")
    try:
        item = Subscription.objects.create(
            name=payload.get("name", "").strip(),
            category=payload.get("category", "").strip(),
            amount=Decimal(str(payload.get("amount", "0"))),
            billing_cycle=payload.get("billingCycle", "monthly"),
            next_billing=_parse_date(payload.get("nextBilling"), "nextBilling"),
            icon=payload.get("icon", "").strip(),
            status=payload.get("status", "active").strip() or "active",
        )
    except (ValueError, InvalidOperation) as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    return JsonResponse(
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "amount": _decimal_to_float(item.amount),
            "billingCycle": item.billing_cycle,
            "nextBilling": item.next_billing.isoformat() if item.next_billing else None,
            "icon": item.icon,
            "status": item.status,
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def short_term_accounts(request):
    if request.method == "GET":
        items = AccountBalance.objects.order_by("name")
        return JsonResponse(
            [
                {
                    "id": item.id,
                    "name": item.name,
                    "institution": item.institution,
                    "type": item.type,
                    "balance": _decimal_to_float(item.balance),
                    "lastUpdated": item.last_updated.isoformat() if item.last_updated else None,
                    "accountNumber": item.account_number,
                    "apy": _decimal_to_float(item.apy),
                    "icon": item.icon,
                }
                for item in items
            ],
            safe=False,
        )

    payload = json.loads(request.body or "{}")
    try:
        item = AccountBalance.objects.create(
            name=payload.get("name", "").strip(),
            institution=payload.get("institution", "").strip(),
            type=payload.get("type", "checking"),
            balance=Decimal(str(payload.get("balance", "0"))),
            last_updated=_parse_date(payload.get("lastUpdated"), "lastUpdated"),
            account_number=payload.get("accountNumber", "").strip(),
            apy=Decimal(str(payload.get("apy"))) if payload.get("apy") is not None else None,
            icon=payload.get("icon", "").strip(),
        )
    except (ValueError, InvalidOperation) as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    return JsonResponse(
        {
            "id": item.id,
            "name": item.name,
            "institution": item.institution,
            "type": item.type,
            "balance": _decimal_to_float(item.balance),
            "lastUpdated": item.last_updated.isoformat() if item.last_updated else None,
            "accountNumber": item.account_number,
            "apy": _decimal_to_float(item.apy),
            "icon": item.icon,
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def short_term_credit_cards(request):
    if request.method == "GET":
        items = CreditCard.objects.order_by("name")
        return JsonResponse(
            [
                {
                    "id": item.id,
                    "name": item.name,
                    "institution": item.institution,
                    "type": item.type,
                    "lastFour": item.last_four,
                    "currentBalance": _decimal_to_float(item.current_balance),
                    "creditLimit": _decimal_to_float(item.credit_limit),
                    "pointsBalance": item.points_balance,
                    "pointsName": item.points_name,
                    "pointsValue": _decimal_to_float(item.points_value),
                    "cashbackRate": _decimal_to_float(item.cashback_rate),
                    "rewardsThisMonth": _decimal_to_float(item.rewards_this_month),
                    "cashbackEarned": _decimal_to_float(item.cashback_earned),
                    "icon": item.icon,
                    "color": item.color,
                }
                for item in items
            ],
            safe=False,
        )

    payload = json.loads(request.body or "{}")
    try:
        item = CreditCard.objects.create(
            name=payload.get("name", "").strip(),
            institution=payload.get("institution", "").strip(),
            type=payload.get("type", "").strip(),
            last_four=payload.get("lastFour", "").strip(),
            current_balance=Decimal(str(payload.get("currentBalance", "0"))),
            credit_limit=Decimal(str(payload.get("creditLimit")))
            if payload.get("creditLimit") is not None
            else None,
            points_balance=payload.get("pointsBalance"),
            points_name=payload.get("pointsName", "").strip(),
            points_value=Decimal(str(payload.get("pointsValue")))
            if payload.get("pointsValue") is not None
            else None,
            cashback_rate=Decimal(str(payload.get("cashbackRate")))
            if payload.get("cashbackRate") is not None
            else None,
            rewards_this_month=Decimal(str(payload.get("rewardsThisMonth")))
            if payload.get("rewardsThisMonth") is not None
            else None,
            cashback_earned=Decimal(str(payload.get("cashbackEarned")))
            if payload.get("cashbackEarned") is not None
            else None,
            icon=payload.get("icon", "").strip(),
            color=payload.get("color", "").strip(),
        )
    except (ValueError, InvalidOperation) as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    return JsonResponse(
        {
            "id": item.id,
            "name": item.name,
            "institution": item.institution,
            "type": item.type,
            "lastFour": item.last_four,
            "currentBalance": _decimal_to_float(item.current_balance),
            "creditLimit": _decimal_to_float(item.credit_limit),
            "pointsBalance": item.points_balance,
            "pointsName": item.points_name,
            "pointsValue": _decimal_to_float(item.points_value),
            "cashbackRate": _decimal_to_float(item.cashback_rate),
            "rewardsThisMonth": _decimal_to_float(item.rewards_this_month),
            "cashbackEarned": _decimal_to_float(item.cashback_earned),
            "icon": item.icon,
            "color": item.color,
        },
        status=201,
    )

