
from rest_framework import serializers
from .models import Notification


# Model or class: NotificationSerializer.

# Serializers for converting between model instances and JSON data.

# NotificationSerializer: Model class for database operations.
class NotificationSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Notification
        fields = [
            'id',
            'destinataire',
            'demande',
            'titre',
            'message',
            'type_alerte',
            'est_lue',
            'date_envoi',
            'date_lecture',
        ]
        read_only_fields = [
            'destinataire',
            'demande',
            'titre',
            'message',
            'type_alerte',
            'date_envoi',
            'date_lecture',
        ]
