
from rest_framework import serializers
from .models import Message, Reponse


# Model or class: ReponseSerializer.

# Serializers for converting between model instances and JSON data.

# ReponseSerializer: Model class for database operations.
class ReponseSerializer(serializers.ModelSerializer):
    assistant_nom = serializers.CharField(source='assistant.nom', read_only=True)
    assistant_prenom = serializers.CharField(source='assistant.prenom', read_only=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Reponse
        fields = ['id', 'message', 'assistant', 'assistant_nom', 'assistant_prenom', 'contenu', 'date_reponse']
        read_only_fields = ['assistant', 'date_reponse', 'message']


# Model or class: MessageSerializer.
# MessageSerializer: Model class for database operations.
class MessageSerializer(serializers.ModelSerializer):
    chercheur_nom = serializers.CharField(source='chercheur.nom', read_only=True)
    chercheur_prenom = serializers.CharField(source='chercheur.prenom', read_only=True)
    reponses = ReponseSerializer(many=True, read_only=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Message
        fields = ['id', 'chercheur', 'chercheur_nom', 'chercheur_prenom',
                  'contenu', 'est_lu', 'est_repondu', 'date_envoi', 'reponses']
        read_only_fields = ['chercheur', 'est_lu', 'est_repondu', 'date_envoi']
