
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from parametres.models import Grade, Laboratoire
from cloudinary.models import CloudinaryField

# Model or class: UserManager.

# Database models and data structure definitions for this Django app.

# UserManager: Class definition.
class UserManager(BaseUserManager):
# Method: create_user.
# Handler for creating new records: create_user.
    def create_user(self, email, password=None, **extra_fields):
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
# Method: create_superuser.
# Handler for creating new records: create_superuser.
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

# Model or class: User.
# User: Class definition.
class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('CHERCHEUR', 'Chercheur'),
        ('ASSISTANT_DPGR', 'Assistant DPGR'),
        ('ADMIN_DPGR', 'Administrateur DPGR'),
        ('SUPER_ADMIN', 'Super Administrateur'),
    ]
# Database field: role.
# role: Database field (models.CharField).
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)
# Database field: email.
# email: Database field (models.EmailField).
    email = models.EmailField(unique=True)
# Database field: nom.
# nom: Database field (models.CharField).
    nom = models.CharField(max_length=30)
# Database field: prenom.
# prenom: Database field (models.CharField).
    prenom = models.CharField(max_length=30)
# Database field: date_joined.
# date_joined: Database field (models.DateTimeField).
    date_joined = models.DateTimeField(auto_now_add=True)
# Database field: derniere_connexion.
# derniere_connexion: Database field (models.DateTimeField).
    derniere_connexion = models.DateTimeField(auto_now=True)
# Database field: is_active.
# is_active: Database field (models.BooleanField).
    is_active = models.BooleanField(default=True)
# Database field: is_staff.
# is_staff: Database field (models.BooleanField).
    is_staff = models.BooleanField(default=False)
# Database field: telephone.
# telephone: Database field (models.CharField).
    telephone = models.CharField(max_length=20, null=True, blank=True)
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']



# Model or class: ProfilChercheur.
# ProfilChercheur: Model class for database operations.
class ProfilChercheur(models.Model):
    
    
    CIVILITE_CHOICES = [
        ('Dr', 'Dr'),
        ('Prof', 'Prof'),
        ('M.', 'M.'),
        ('Mme', 'Mme'),
        ('Mlle', 'Mlle'),
    ]

    # Informations personnelles
# user: Database field (models.OneToOneField).
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profil')
# Database field: civilite.
# civilite: Database field (models.CharField).
    civilite = models.CharField(max_length=10, choices=CIVILITE_CHOICES, null=True, blank=True)
# Database field: date_naissance.
# date_naissance: Database field (models.DateField).
    date_naissance = models.DateField(null=True, blank=True)
# Database field: email_personnel.
# email_personnel: Database field (models.EmailField).
    email_personnel = models.EmailField(null=True, blank=True)
# Database field: tel_mobile.
# tel_mobile: Database field (models.CharField).
    tel_mobile = models.CharField(max_length=20, null=True, blank=True)
# Database field: tel_fixe.
# tel_fixe: Database field (models.CharField).
    tel_fixe = models.CharField(max_length=20, null=True, blank=True)
# Database field: nationalite.
# nationalite: Database field (models.CharField).
    nationalite = models.CharField(max_length=50, null=True, blank=True)
# Database field: adresse.
# adresse: Database field (models.TextField).
    adresse = models.TextField(null=True, blank=True)
    photo_profil = CloudinaryField('image', null=True, blank=True)

    # Informations professionnelles
# grade: Database field (models.ForeignKey).
    grade = models.ForeignKey(
        Grade,
# Database field: on_delete.
# on_delete: Database field (models.SET_NULL,).
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
# Database field: departement.
# departement: Database field (models.CharField).
    departement = models.CharField(max_length=100, null=True, blank=True)
# Database field: laboratoire.
# laboratoire: Database field (models.ForeignKey).
    laboratoire = models.ForeignKey(Laboratoire, on_delete=models.SET_NULL, null=True, blank=True)
# Database field: equipe_recherche.
# equipe_recherche: Database field (models.CharField).
    equipe_recherche = models.CharField(max_length=200, null=True, blank=True)
# Database field: matricule_esi.
# matricule_esi: Database field (models.CharField).
    matricule_esi = models.CharField(max_length=30, unique=True, null=True, blank=True)
# Database field: date_recrutement.
# date_recrutement: Database field (models.DateField).
    date_recrutement = models.DateField(null=True, blank=True)
# Database field: email_professionnel.
# email_professionnel: Database field (models.EmailField).
    email_professionnel = models.EmailField(null=True, blank=True)
# Database field: bureau.
# bureau: Database field (models.CharField).
    bureau = models.CharField(max_length=50, null=True, blank=True)

    # Domaines de recherche
# domaine_principal: Database field (models.CharField).
    domaine_principal = models.CharField(max_length=100, null=True, blank=True)
# Database field: mots_cles.
# mots_cles: Database field (models.TextField).
    mots_cles = models.TextField(null=True, blank=True)
# Database field: biographie.
# biographie: Database field (models.TextField).
    biographie = models.TextField(max_length=500, null=True, blank=True)

    # Liens professionnels
# google_scholar: Database field (models.URLField).
    google_scholar = models.URLField(null=True, blank=True)
# Database field: researchgate.
# researchgate: Database field (models.URLField).
    researchgate = models.URLField(null=True, blank=True)
# Database field: orcid.
# orcid: Database field (models.CharField).
    orcid = models.CharField(max_length=50, null=True, blank=True)
# Database field: linkedin.
# linkedin: Database field (models.URLField).
    linkedin = models.URLField(null=True, blank=True)
# Database field: github.
# github: Database field (models.URLField).
    github = models.URLField(null=True, blank=True)
# Database field: website_personnel.
# website_personnel: Database field (models.URLField).
    website_personnel = models.URLField(null=True, blank=True)

    # Autres champs existants
# anciennete: Database field (models.IntegerField).
    anciennete = models.IntegerField(default=0)
# Database field: dernier_sejour.
# dernier_sejour: Database field (models.DateField).
    dernier_sejour = models.DateField(null=True, blank=True)
# Database field: nombre_sejours_effectues.
# nombre_sejours_effectues: Database field (models.IntegerField).
    nombre_sejours_effectues = models.IntegerField(default=0)
# Database field: total_jours_sejour.
# total_jours_sejour: Database field (models.IntegerField).
    total_jours_sejour = models.IntegerField(default=0)
# Database field: nb_sejours_3_dernières_années.
# nb_sejours_3_dernières_années: Database field (models.IntegerField).
    nb_sejours_3_dernières_années = models.IntegerField(default=0)
# Database field: nombre_inscri.
# nombre_inscri: Database field (models.IntegerField).
    nombre_inscri = models.IntegerField(default=1) 
# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"Profil de {self.user.email}"
    @property # jai ajouter ça khouya abdallah
# Method: est_salarie.
# Method: est_salarie.
    def est_salarie(self):
        return self.grade.nom == 'ENS'
