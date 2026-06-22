
from django.db import models

# Model or class: GrilleEvaluation.

# Database models and data structure definitions for this Django app.

# GrilleEvaluation: Model class for database operations.
class GrilleEvaluation(models.Model):
# Database field: code.
# code: Database field (models.CharField).
    code = models.CharField(max_length=20, unique=True)
# Database field: name.
# name: Database field (models.CharField).
    name = models.CharField(max_length=100)
# Database field: is_active.
# is_active: Database field (models.BooleanField).
    is_active = models.BooleanField(default=False)
# Database field: DateVersion.
# DateVersion: Database field (models.DateField).
    DateVersion = models.DateField(auto_now_add=True)
# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.name


# Model or class: CritereEvaluation.
# CritereEvaluation: Model class for database operations.
class CritereEvaluation(models.Model):
    TYPE_CRITERE_CHOICES = [
        ('AUTO', 'Automatique'),
        ('MANUEL', 'Manuel'),
    ]

# Database field: name.
# name: Database field (models.CharField).
    name = models.CharField(max_length=100)
# Database field: description.
# description: Database field (models.TextField).
    description = models.TextField(blank=True)
# Database field: weight.
# weight: Database field (models.FloatField).
    weight = models.FloatField()
# Database field: is_active.
# is_active: Database field (models.BooleanField).
    is_active = models.BooleanField(default=True)
# Database field: type_critere.
# type_critere: Database field (models.CharField).
    type_critere = models.CharField(
        max_length=10,
        choices=TYPE_CRITERE_CHOICES,
        default='MANUEL'  # ← CHANGÉ À MANUEL
    )
# Database field: grille.
# grille: Database field (models.ForeignKey).
    grille = models.ForeignKey(GrilleEvaluation, on_delete=models.CASCADE, related_name='criteres')
    
    # ✨ NOUVEAU: Pour la logique personnalisée du SuperAdmin
# donnees_necessaires: Database field (models.JSONField).
    donnees_necessaires = models.JSONField(
        default=list,
        blank=True,
        help_text="Liste des données à saisir: ['experience_years', 'publications_count']"
    )
    
# Database field: description_donnees.
# description_donnees: Database field (models.JSONField).
    description_donnees = models.JSONField(
        default=dict,
        blank=True,
        help_text="Description de chaque donnée pour le chercheur"
    )
    
# Database field: logique_verification.
# logique_verification: Database field (models.TextField).
    logique_verification = models.TextField(
        blank=True,
        help_text="Logique de vérification: experience_years > 5 AND publications_count >= 3"
    )
    
# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.name


# Model or class: EligibiliteEvaluation.
# EligibiliteEvaluation: Model class for database operations.
class EligibiliteEvaluation(models.Model):
    RESULTAT_CHOICES = [
        ('ELIGIBLE', 'Éligible'),
        ('INELIGIBLE', 'Inéligible'),
    ]
    
# Database field: demande.
# demande: Database field (models.OneToOneField).
    demande = models.OneToOneField("demandes.Demande", on_delete=models.CASCADE, related_name='eligibilite')
# Database field: dernier_stage_valide.
# dernier_stage_valide: Database field (models.BooleanField).
    dernier_stage_valide = models.BooleanField()
# Database field: nb_stages_valide.
# nb_stages_valide: Database field (models.BooleanField).
    nb_stages_valide = models.BooleanField()
# Database field: resultat.
# resultat: Database field (models.CharField).
    resultat = models.CharField(max_length=15, choices=RESULTAT_CHOICES)
# Database field: date_verification.
# date_verification: Database field (models.DateTimeField).
    date_verification = models.DateTimeField(auto_now_add=True)
# Database field: justification.
# justification: Database field (models.TextField).
    justification = models.TextField(blank=True)
    
# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"Éligibilité - {self.demande.numero_demande}"


# ✨ NOUVEAU: Pour sauvegarder les réponses du chercheur
# ReponseCritere: Model class for database operations.
class ReponseCritere(models.Model):
    """
    Stocke les données saisies par le chercheur pour chaque critère
    et le résultat de la vérification
    """
# Database field: demande.
# demande: Database field (models.ForeignKey).
    demande = models.ForeignKey("demandes.Demande", on_delete=models.CASCADE, related_name='reponses_criteres')
# Database field: critere.
# critere: Database field (models.ForeignKey).
    critere = models.ForeignKey(CritereEvaluation, on_delete=models.CASCADE, related_name='reponses')
    
    # Les données saisies par le chercheur
    # Exemple: {"experience_years": 7, "publications_count": 5}
# donnees: Database field (models.JSONField).
    donnees = models.JSONField(default=dict)
    
    # Résultat de la vérification (True/False)
# is_validated: Database field (models.BooleanField).
    is_validated = models.BooleanField(null=True, blank=True)
    
    # Justification
# justification: Database field (models.TextField).
    justification = models.TextField(blank=True)
    
# Database field: date_reponse.
# date_reponse: Database field (models.DateTimeField).
    date_reponse = models.DateTimeField(auto_now_add=True)
    
# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        unique_together = ('demande', 'critere')
    
# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"{self.demande.numero_demande} - {self.critere.name}"
