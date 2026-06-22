
from django.contrib import admin
from .models import Log



# Django admin interface configuration for this app.

@admin.register(Log)
# Model or class: LogAdmin.
# LogAdmin: Model class for database operations.
class LogAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'action',
        'ip_address',
        'date_action',
    )

    list_filter = (
        'action',
        'date_action',
    )

    search_fields = (
        'user__username',
        'action',
        'details',
        'ip_address',
    )

    ordering = ('-date_action',)

    readonly_fields = (
        'user',
        'action',
        'details',
        'ip_address',
        'date_action',
    )

    list_per_page = 20
