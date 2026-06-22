
# parametres/serializers.py
from rest_framework import serializers
from .models import Zone, pays, Grade, typeSejour, Session, Laboratoire


# Model or class: ZoneGeographiqueSerializer.

# Serializers for converting between model instances and JSON data.

# ZoneGeographiqueSerializer: Model class for database operations.
class ZoneGeographiqueSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Zone
        fields = ["id", "name"]


# Model or class: PaysSerializer.
# PaysSerializer: Model class for database operations.
class PaysSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = pays
        fields = ["id", "name", "zone"]  # zone = FK (on envoie zone_id)

# Method: validate.
# Method: validate.
    def validate(self, attrs):
        if not attrs.get("zone"):
            raise serializers.ValidationError({"zone": "La zone est obligatoire."})
        return attrs


# Model or class: GradeSerializer.
# GradeSerializer: Model class for database operations.
class GradeSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Grade
        fields = ["id", "nom"]  # ordre n'est plus utilisé

    


# Model or class: TypeSejourSerializer.
# TypeSejourSerializer: Model class for database operations.
class TypeSejourSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = typeSejour
        fields = ['id', 'code', 'duree_min_jours', 'duree_max_jours']

# Method: validate.
# Method: validate.
    def validate(self, attrs):
        min_j = attrs.get("duree_min_jours")
        max_j = attrs.get("duree_max_jours")
        if min_j is not None and max_j is not None and min_j > max_j:
            raise serializers.ValidationError(
                "La durée minimale ne peut pas être supérieure à la durée maximale."
            )
        return attrs


# Model or class: SessionSerializer.
# SessionSerializer: Model class for database operations.
class SessionSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Session
        fields = ["id", "annee_academique", "date_ouverture", "date_fermeture", "etat", "grille_evaluation", "nb_sejours_min", "annees_depuis_dernier_sejour"]

# Method: validate.
# Method: validate.
    def validate(self, attrs):
        d1 = attrs.get("date_ouverture")
        d2 = attrs.get("date_fermeture")
        # Pour PATCH: si une des dates manque, on ne bloque pas ici
        if d1 is not None and d2 is not None and d1 >= d2:
            raise serializers.ValidationError(
                "La date d'ouverture doit être antérieure à la date de fermeture."
            )
        return attrs


# Model or class: LaboratoireSerializer.
# LaboratoireSerializer: Model class for database operations.
class LaboratoireSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Laboratoire
        fields = ["id", "code", "name", "directeur", "actif"]
