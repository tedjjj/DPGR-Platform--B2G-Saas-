
from django.apps import AppConfig

# Model or class: LogsConfig.

# Utility functions and helper code.

# LogsConfig: Model class for database operations.
class LogsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'logs'

# Method: ready.
# Method: ready.
    def ready(self):
        import logs.signals
