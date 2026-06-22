
from rest_framework import serializers
from .models import GrilleEvaluation, CritereEvaluation, EligibiliteEvaluation, ReponseCritere


# Model or class: CritereEvaluationSerializer.

# Serializers for converting between model instances and JSON data.

# CritereEvaluationSerializer: Model class for database operations.
class CritereEvaluationSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = CritereEvaluation
        fields = '__all__'


# Model or class: GrilleEvaluationSerializer.
# GrilleEvaluationSerializer: Model class for database operations.
class GrilleEvaluationSerializer(serializers.ModelSerializer):
    criteres = CritereEvaluationSerializer(many=True, read_only=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = GrilleEvaluation
        fields = '__all__'


# Model or class: EligibiliteEvaluationSerializer.
# EligibiliteEvaluationSerializer: Model class for database operations.
class EligibiliteEvaluationSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = EligibiliteEvaluation
        fields = '__all__'

# Model or class: ReponseCritereSerializer.
# ReponseCritereSerializer: Model class for database operations.
class ReponseCritereSerializer(serializers.ModelSerializer):
    critere_name = serializers.CharField(source='critere.name', read_only=True)
    critere_weight = serializers.FloatField(source='critere.weight', read_only=True)
    
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = ReponseCritere
        fields = [
            'id',
            'demande',
            'critere',
            'critere_name',
            'critere_weight',
            'donnees',
            'is_validated',
            'justification',
            'date_reponse'
        ]


'''class ValidationCritereSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = ValidationCritere
        fields = '__all__


# Model or class: EvaluationDemandeSerializer.
# EvaluationDemandeSerializer: Model class for database operations.
class EvaluationDemandeSerializer(serializers.ModelSerializer):
    validations = ValidationCritereSerializer(many=True, read_only=True)
    score_total = serializers.FloatField(read_only=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = EvaluationDemande
        fields = '__all__'''
