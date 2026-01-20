from django.db import models


class SpendingTransaction(models.Model):
    date = models.DateField()
    category = models.CharField(max_length=64)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.date} {self.category} {self.amount}"


class Subscription(models.Model):
    BILLING_CYCLE_CHOICES = [
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
    ]

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=64)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=16, choices=BILLING_CYCLE_CHOICES)
    next_billing = models.DateField(null=True, blank=True)
    icon = models.CharField(max_length=16, blank=True)
    status = models.CharField(max_length=32, default="active")

    def __str__(self) -> str:
        return self.name


class AccountBalance(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ("checking", "Checking"),
        ("savings", "Savings"),
        ("credit", "Credit"),
        ("brokerage", "Brokerage"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=120)
    institution = models.CharField(max_length=120, blank=True)
    type = models.CharField(max_length=32, choices=ACCOUNT_TYPE_CHOICES, default="checking")
    balance = models.DecimalField(max_digits=12, decimal_places=2)
    last_updated = models.DateField(null=True, blank=True)
    account_number = models.CharField(max_length=32, blank=True)
    apy = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    icon = models.CharField(max_length=16, blank=True)

    def __str__(self) -> str:
        return self.name


class CreditCard(models.Model):
    name = models.CharField(max_length=120)
    institution = models.CharField(max_length=120, blank=True)
    type = models.CharField(max_length=64, blank=True)
    last_four = models.CharField(max_length=4, blank=True)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    points_balance = models.IntegerField(null=True, blank=True)
    points_name = models.CharField(max_length=120, blank=True)
    points_value = models.DecimalField(max_digits=6, decimal_places=4, null=True, blank=True)
    cashback_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    rewards_this_month = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    cashback_earned = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    icon = models.CharField(max_length=16, blank=True)
    color = models.CharField(max_length=16, blank=True)

    def __str__(self) -> str:
        return self.name

