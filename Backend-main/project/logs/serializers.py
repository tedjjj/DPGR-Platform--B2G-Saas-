
from rest_framework import serializers
from .models import Log

# Model or class: LogSerializer.

# Serializers for converting between model instances and JSON data.

# LogSerializer: Model class for database operations.
class LogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Log
        fields = [
            'id', 'user_name', 'user_email', 'user_role',
            'action', 'details', 'ip_address', 'date_action'
        ]

# Getter method: get_user_name.
# Getter function: get_user_name.
    def get_user_name(self, obj):
        if not obj.user:
            return None
        return f"{obj.user.prenom} {obj.user.nom}".strip() or obj.user.email

# Getter method: get_user_email.
# Getter function: get_user_email.
    def get_user_email(self, obj):
        return obj.user.email if obj.user else None

# Getter method: get_user_role.
# Getter function: get_user_role.
    def get_user_role(self, obj):
        return obj.user.role if obj.user else None
