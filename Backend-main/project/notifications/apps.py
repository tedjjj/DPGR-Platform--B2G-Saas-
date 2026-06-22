
from django.apps import AppConfig


# Model or class: NotificationsConfig.

# Utility functions and helper code.

# NotificationsConfig: Model class for database operations.
class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'

# Method: ready.
# Method: ready.
    def ready(self):
        import notifications.signals
