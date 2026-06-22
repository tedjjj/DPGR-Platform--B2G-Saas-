
from django.db import models
from evaluations.models import GrilleEvaluation


# Create your models here.

# Database models and data structure definitions for this Django app.

# Zone: Model class for database operations.
class Zone(models.Model):
# Database field: name.
# name: Database field (models.CharField).
    name = models.CharField(max_length=100, unique=True)

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.name

# Model or class: pays.
# pays: Model class for database operations.
class pays(models.Model):
# Database field: name.
# name: Database field (models.CharField).
    name = models.CharField(max_length=100)
# Database field: zone.
# zone: Database field (models.ForeignKey).
    zone = models.ForeignKey(Zone,on_delete=models.PROTECT,related_name='pays') #a revoir

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.name
    

'''class Grade(models.Model):
# Database field: code.
# code: Database field (models.CharField).
    code = models.CharField(max_length=20, unique=True)
# Database field: libelle.
# libelle: Database field (models.CharField).
    libelle = models.CharField(max_length=100)
# Database field: ordre.
# ordre: Database field (models.PositiveIntegerField).
    ordre = models.PositiveIntegerField()

# Database field: actif.
# actif: Database field (models.BooleanField).
    actif = models.BooleanField(default=True)

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.libelle'''
# Model or class: Grade.
# Grade: Model class for database operations.
class Grade(models.Model): # jai changer la classe grade  
   
    
    GRADE_CHOICES = [
        ('ENS', 'Enseignant Chercheur (MAA/MAB)'),
        ('DOC_NS', 'Doctorant Non-Salarié'),
        ('MC_B', 'Maître de Conférences Classe B'),
        ('MC_A', 'Maître de Conférences Classe A'),
        ('PROF', 'Professeur'),
    ]

# Database field: nom.
# nom: Database field (models.CharField).
    nom = models.CharField(
        max_length=10, 
        choices=GRADE_CHOICES, 
        unique=True,
        help_text="Le code court utilisé par le moteur d'éligibilité",
        default = "worker"
    )
    
    
    
    
    '''est_salarie = models.BooleanField(
        default=True, 
        help_text="Cochez pour les enseignants, décochez pour DOC_NS"
    )'''

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"{self.get_nom_display()} ({self.nom})"

# Model or class: typeSejour.
# typeSejour: Model class for database operations.
class typeSejour(models.Model): # jai changer la classe typeSejour
# Model or class: CodeChoices.
# CodeChoices: Model class for database operations.
    class CodeChoices(models.TextChoices):
        SEJOUR_SCIENTIFIQUE = 'SSHN', 'Séjour Scientifique de Haut Niveau'
        STAGE_PERFECTIONNEMENT = 'SPCTT', 'Stage de Perfectionnement CTT'

# Database field: code.
# code: Database field (models.CharField).
    code = models.CharField(
        max_length=50,
        choices=CodeChoices.choices,
        unique=True
    )
    
# Database field: duree_min_jours.
# duree_min_jours: Database field (models.PositiveIntegerField).
    duree_min_jours = models.PositiveIntegerField(null=True, blank=True)
# Database field: duree_max_jours.
# duree_max_jours: Database field (models.PositiveIntegerField).
    duree_max_jours = models.PositiveIntegerField(null=True, blank=True)
    

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.get_code_display()
    
# Model or class: Session.
# Session: Model class for database operations.
class Session(models.Model):
# Database field: annee_academique.
# annee_academique: Database field (models.CharField).
    annee_academique = models.CharField(max_length=20, unique=True)
# Database field: date_ouverture.
# date_ouverture: Database field (models.DateField).
    date_ouverture = models.DateField()
# Database field: date_fermeture.
# date_fermeture: Database field (models.DateField).
    date_fermeture = models.DateField()

# Database field: etat.
# etat: Database field (models.CharField).
    etat = models.CharField(
        max_length=10,
        choices=[
            ("OUVERTE", "Ouverte"),
            ("FERMEE", "Fermée"),
        ],
        default="FERMEE"
    )
# Database field: grille_evaluation.
# grille_evaluation: Database field (models.ForeignKey).
    grille_evaluation = models.ForeignKey(
        'evaluations.GrilleEvaluation',
# Database field: on_delete.
# on_delete: Database field (models.SET_NULL,).
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sessions',
        help_text="Grille d'évaluation utilisée pour cette session"
    )
     # Seuils d'éligibilité
# nb_sejours_min: Database field (models.PositiveIntegerField).
    nb_sejours_min = models.PositiveIntegerField(default=1)
# Database field: annees_depuis_dernier_sejour.
# annees_depuis_dernier_sejour: Database field (models.PositiveIntegerField).
    annees_depuis_dernier_sejour = models.PositiveIntegerField(default=2)

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return self.annee_academique
    @property
# Method: est_ouverte.
# Method: est_ouverte.
    def est_ouverte(self):
        """Retourne True si la session est ouverte"""
        return self.etat == "OUVERTE"

    @property
# Method: est_fermee.
# Method: est_fermee.
    def est_fermee(self):
        """Retourne True si la session est fermée"""
        return self.etat == "FERMEE"

    @property
# Method: doit_ouverte.
# Method: doit_ouverte.
    def doit_ouverte(self):
        """Retourne True si la date d'ouverture est passée"""
        from django.utils import timezone
        today = timezone.now().date()
        return today >= self.date_ouverture and self.est_fermee

    @property
# Method: doit_fermee.
# Method: doit_fermee.
    def doit_fermee(self):
        """Retourne True si la date de fermeture est passée"""
        from django.utils import timezone
        today = timezone.now().date()
        return today >= self.date_fermeture and self.est_ouverte
    
# Model or class: Laboratoire.
# Laboratoire: Model class for database operations.
class Laboratoire(models.Model):
# Database field: code.
# code: Database field (models.CharField).
    code = models.CharField(max_length=30, unique=True)     # ex: LRI, LMCS...
# Database field: name.
# name: Database field (models.CharField).
    name = models.CharField(max_length=200)
# Database field: directeur.
# directeur: Database field (models.CharField).
    directeur = models.CharField(max_length=150, null=True, blank=True)

# Database field: actif.
# actif: Database field (models.BooleanField).
    actif = models.BooleanField(default=True)

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"{self.code} - {self.name}"
    
    
