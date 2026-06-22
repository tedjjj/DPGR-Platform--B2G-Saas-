
from django.contrib import admin

# Register your models here.
# on ajoute notification dans l'admin
from .models import Notification

# Django admin interface configuration for this app.

@admin.register(Notification)
# Model or class: NotificationAdmin.
# NotificationAdmin: Model class for database operations.
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('destinataire', 'type_alerte', 'est_lue', 'date_envoi')
    list_filter = ('type_alerte', 'est_lue', 'date_envoi')
    search_fields = ('destinataire__email', 'message')
