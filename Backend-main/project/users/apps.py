
from django.apps import AppConfig

# Model or class: UsersConfig.

# Utility functions and helper code.

# UsersConfig: Model class for database operations.
class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users'

# Method: ready.
# Method: ready.
    def ready(self):
        import users.signals
