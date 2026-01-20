from django.contrib import admin
from django.urls import path

from .views import (
    health,
    short_term_accounts,
    short_term_credit_cards,
    short_term_subscriptions,
    short_term_transactions,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/health/", health),
    path("api/short-term/transactions/", short_term_transactions),
    path("api/short-term/subscriptions/", short_term_subscriptions),
    path("api/short-term/accounts/", short_term_accounts),
    path("api/short-term/credit-cards/", short_term_credit_cards),
]

