
from rest_framework import serializers
from .models import Demande, Document, Decision, Rapport, Log, CoutDemande, typeSejour, FichierRapport
from parametres.serializers import TypeSejourSerializer  


# Serializers for converting between model instances and JSON data.

CLOUDINARY_BASE = "https://res.cloudinary.com/dplaxtndw/raw/upload"

# Method: build_cloudinary_url.
# Function: build_cloudinary_url.
def build_cloudinary_url(fichier):
    if not fichier:
        return None
# Error handling block.
    try:
        return fichier.url.replace('http://', 'https://')
    except:
        return None

# Model or class: CoutDemandeSerializer.
# CoutDemandeSerializer: Model class for database operations.
class CoutDemandeSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = CoutDemande
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


# Model or class: DemandeSerializer.
# DemandeSerializer: Model class for database operations.
class DemandeSerializer(serializers.ModelSerializer):
    chercheur_nom = serializers.CharField(source='chercheur.user.nom', read_only=True)
    chercheur_prenom = serializers.CharField(source='chercheur.user.prenom', read_only=True)
    chercheur_grade = serializers.CharField(source='chercheur.grade', read_only=True)
    chercheur_laboratoire = serializers.CharField(source='chercheur.laboratoire.name', read_only=True)
    cout = CoutDemandeSerializer(read_only=True)
    type_sejour = TypeSejourSerializer(read_only=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Demande
        fields = [
            'id', 'numero_demande', 'chercheur', 'chercheur_nom', 'chercheur_prenom',
            'chercheur_grade', 'chercheur_laboratoire', 'type_sejour', 'session',
            'pays', 'date_debut', 'date_fin', 'duree_jours', 'destination',
            'institution_accueil', 'ville_accueil', 'objectifs_scientifiques',
            'statut', 'date_soumission', 'eligible', 'score_total',
            'recommandation_auto', 'montant_indemnite', 'notes_internes', 'cout',
        ]
        read_only_fields = [
            'chercheur', 'numero_demande', 'duree_jours', 'statut',
            'date_soumission', 'eligible', 'score_total', 'recommandation_auto',
            'montant_indemnite', 'notes_internes', 'attestation',
        ]

# Method: validate.
# Method: validate.
    def validate(self, attrs):
        date_debut = attrs.get('date_debut')
        date_fin = attrs.get('date_fin')
        if date_debut and date_fin and date_debut >= date_fin:
            raise serializers.ValidationError(
                "La date de début doit être antérieure à la date de fin."
            )
        return attrs


# Model or class: DocumentSerializer.
# DocumentSerializer: Model class for database operations.
class DocumentSerializer(serializers.ModelSerializer):

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Document
        fields = ['id', 'demande', 'fichier', 'type_document', 'est_obligatoire', 'date_upload']
        read_only_fields = ['date_upload', 'demande']

# Method: to_representation.
# Method: to_representation.
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['fichier'] = build_cloudinary_url(instance.fichier)
        return ret


# Model or class: DecisionSerializer.
# DecisionSerializer: Model class for database operations.
class DecisionSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Decision
        fields = '__all__'
        read_only_fields = ['pris_par', 'date_decision']


# Model or class: FichierRapportSerializer.
# FichierRapportSerializer: Model class for database operations.
class FichierRapportSerializer(serializers.ModelSerializer):

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = FichierRapport
        fields = ['id', 'fichier', 'nom', 'type_fichier', 'date_upload']
        read_only_fields = ['date_upload']

# Method: to_representation.
# Method: to_representation.
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['fichier'] = build_cloudinary_url(instance.fichier)
        return ret


# Model or class: RapportSerializer.
# RapportSerializer: Model class for database operations.
class RapportSerializer(serializers.ModelSerializer):
    fichiers = FichierRapportSerializer(many=True, read_only=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Rapport
        fields = [
            'id', 'demande',
            'date_depart_reelle', 'date_retour_reelle',
            'description', 'objectif_formation', 'objectif_collaboration',
            'objectif_publication', 'objectif_presentation', 'objectif_autre',
            'objectif_autre_text',
            'resultats', 'publications', 'collaborations', 'impact',
            'fichiers',
            'rating', 'points_positifs', 'difficultes', 'recommande',
            'civilite', 'nom_complet', 'date_signe',
            'valide_par', 'date_soumission', 'est_valide',
            'commentaires_retour', 'date_validation', 'statut',
        ]
        read_only_fields = [
            'valide_par', 'date_soumission', 'est_valide',
            'commentaires_retour', 'date_validation', 'statut',
        ]


# Model or class: LogSerializer.
# LogSerializer: Model class for database operations.
class LogSerializer(serializers.ModelSerializer):
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        model = Log
        fields = '__all__'
        read_only_fields = ['user', 'date_action']
