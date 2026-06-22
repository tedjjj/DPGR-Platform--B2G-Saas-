
from django.db import models
from parametres.models import typeSejour, Session, pays
from users.models import ProfilChercheur, User
from cloudinary.models import CloudinaryField
# Create your models here.

# Model or class: StatutDemande.

# Database models and data structure definitions for this Django app.

# StatutDemande: Model class for database operations.
class StatutDemande(models.TextChoices):
    BROUILLON = 'BROUILLON', 'Brouillon'
    SOUMISE = 'SOUMISE', 'Soumise'
    VERIFICATION_AUTOMATIQUE = 'VERIFICATION_AUTOMATIQUE', 'Vérification automatique'
    PREPARATION_CS = 'PREPARATION_CS', 'Préparation CS'
    DELIBERATION_CS = 'DELIBERATION_CS', 'Délibération CS'
    APPROUVEE = 'APPROUVEE', 'Approuvée'
    REJETEE = 'REJETEE', 'Rejetée'
    EN_ATTENTE = 'EN_ATTENTE', 'En attente'
    TERMINEE = 'TERMINEE', 'Terminée'
    DEMANDE_ANNULATION = 'DEMANDE_ANNULATION', 'Demande annulation'
    DELIBERATION_CS_FIN = 'DELIBERATION_CS_FIN', 'Délibération CS fin'
    CLOTUREE = 'CLOTUREE', 'Clôturée'
    ANNULEE = 'ANNULEE', 'Annulée'

    
# Model or class: Demande.
# Demande: Model class for database operations.
class Demande(models.Model):
    
    # Champs de base
# numero_demande: Database field (models.CharField).
    numero_demande = models.CharField(max_length=50, unique=True)
# Database field: date_debut.
# date_debut: Database field (models.DateField).
    date_debut = models.DateField()
# Database field: date_fin.
# date_fin: Database field (models.DateField).
    date_fin = models.DateField()
# Database field: duree_jours.
# duree_jours: Database field (models.IntegerField).
    duree_jours = models.IntegerField(null=True, blank=True)
# Database field: destination.
# destination: Database field (models.CharField).
    destination = models.CharField(max_length=200)
# Database field: institution_accueil.
# institution_accueil: Database field (models.CharField).
    institution_accueil = models.CharField(max_length=200)
# Database field: ville_accueil.
# ville_accueil: Database field (models.CharField).
    ville_accueil = models.CharField(max_length=100)
# Database field: objectifs_scientifiques.
# objectifs_scientifiques: Database field (models.TextField).
    objectifs_scientifiques = models.TextField()
# Database field: date_soumission.
# date_soumission: Database field (models.DateTimeField).
    date_soumission = models.DateTimeField(null=True, blank=True)
# Database field: eligible.
# eligible: Database field (models.BooleanField).
    eligible = models.BooleanField(default=False)
# Database field: score_total.
# score_total: Database field (models.FloatField).
    score_total = models.FloatField(null=True, blank=True)
# Database field: score_criteres.
# score_criteres: Database field (models.FloatField).
    score_criteres = models.FloatField(null=True, blank=True, default=0) #ajouter ceci pour stocker le score des criters
# Database field: score_final.
# score_final: Database field (models.FloatField).
    score_final = models.FloatField(null=True, blank=True) #ajouter ceci pour stocker le score final
# Database field: recommandation_auto.
# recommandation_auto: Database field (models.TextField).
    recommandation_auto = models.TextField(null=True, blank=True)
# Database field: montant_indemnite.
# montant_indemnite: Database field (models.FloatField).
    montant_indemnite = models.FloatField(null=True, blank=True)
# Database field: notes_internes.
# notes_internes: Database field (models.TextField).
    notes_internes = models.TextField(null=True, blank=True)

    # Statut
# statut: Database field (models.CharField).
    statut = models.CharField(
        max_length=30,
        choices=StatutDemande.choices,
        default=StatutDemande.BROUILLON
    )

    # Relations
    attestation = CloudinaryField('raw', null=True, blank=True)
# Database field: chercheur.
# chercheur: Database field (models.ForeignKey).
    chercheur = models.ForeignKey(ProfilChercheur, on_delete=models.PROTECT, related_name='demandes')
# Database field: type_sejour.
# type_sejour: Database field (models.ForeignKey).
    type_sejour = models.ForeignKey(typeSejour, on_delete=models.PROTECT, related_name='demandes',null=True,blank=True)#modified
# Database field: session.
# session: Database field (models.ForeignKey).
    session = models.ForeignKey(Session, on_delete=models.PROTECT, related_name='demandes')
# Database field: pays.
# pays: Database field (models.ForeignKey).
    pays = models.ForeignKey(pays, on_delete=models.PROTECT, related_name='demandes')
# Method: save.
# Method: save.
    def save(self, *args, **kwargs):
        # Calculer la durée en jours automatiquement - hadi abdallah m3ndouch
        if self.date_debut and self.date_fin:
            self.duree_jours = (self.date_fin - self.date_debut).days
        if not self.pk and not self.type_sejour:
            from parametres.views import affecter_type_sejour
            self.type_sejour = affecter_type_sejour(self.chercheur.grade)
        super().save(*args, **kwargs)

# Model or class: Document.
# Document: Model class for database operations.
class Document(models.Model):

# Database field: demande.
# demande: Database field (models.ForeignKey).
    demande = models.ForeignKey(
        Demande,
# Database field: on_delete.
# on_delete: Database field (models.CASCADE,).
        on_delete=models.CASCADE,
        related_name="documents"
    )

    fichier = CloudinaryField('raw', null=True, blank=True, type='upload')

# Database field: type_document.
# type_document: Database field (models.CharField).
    type_document = models.CharField(max_length=100)

# Database field: est_obligatoire.
# est_obligatoire: Database field (models.BooleanField).
    est_obligatoire = models.BooleanField(default=False)

# Database field: date_upload.
# date_upload: Database field (models.DateTimeField).
    date_upload = models.DateTimeField(auto_now_add=True)

# Model or class: Decision.
# Decision: Model class for database operations.
class Decision(models.Model):
# Database field: demande.
# demande: Database field (models.ForeignKey).
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='decisions')
# Database field: pris_par.
# pris_par: Database field (models.ForeignKey).
    pris_par = models.ForeignKey(User, on_delete=models.PROTECT, related_name='decisions')
# Database field: decision.
# decision: Database field (models.CharField).
    decision = models.CharField(max_length=50)
# Database field: motif_rejet.
# motif_rejet: Database field (models.CharField).
    motif_rejet = models.CharField(max_length=500, null=True, blank=True)
# Database field: notes_commentaires.
# notes_commentaires: Database field (models.TextField).
    notes_commentaires = models.TextField(null=True, blank=True)
# Database field: date_decision.
# date_decision: Database field (models.DateTimeField).
    date_decision = models.DateTimeField(auto_now_add=True)


# Model or class: Rapport.
# Rapport: Model class for database operations.
class Rapport(models.Model):
# Model or class: StatutRapport.
# StatutRapport: Model class for database operations.
    class StatutRapport(models.TextChoices):
        EN_ATTENTE = 'EN_ATTENTE', 'En attente'
        VALIDE = 'VALIDE', 'Validé'
        A_CORRIGER = 'A_CORRIGER', 'À corriger'

# Model or class: RecommandationChoices.
# RecommandationChoices: Model class for database operations.
    class RecommandationChoices(models.TextChoices):
        OUI_FORTEMENT = 'oui_fortement', 'Oui, fortement'
        OUI = 'oui', 'Oui'
        NEUTRE = 'neutre', 'Neutre'
        NON = 'non', 'Non'

# Model or class: CiviliteChoices.
# CiviliteChoices: Model class for database operations.
    class CiviliteChoices(models.TextChoices):
        DR = 'Dr', 'Dr'
        PROF = 'Prof', 'Prof'
        M = 'M.', 'M.'
        MME = 'Mme', 'Mme'
        MLLE = 'Mlle', 'Mlle'

    # ── Relation ──
# demande: Database field (models.OneToOneField).
    demande = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='rapport')

    # ── Section 1 : dates réelles ──
# date_depart_reelle: Database field (models.DateField).
    date_depart_reelle = models.DateField(null=True, blank=True)
# Database field: date_retour_reelle.
# date_retour_reelle: Database field (models.DateField).
    date_retour_reelle = models.DateField(null=True, blank=True)

    # ── Section 2 : Activités ──
# description: Database field (models.TextField).
    description = models.TextField(null=True, blank=True)
# Database field: objectif_formation.
# objectif_formation: Database field (models.BooleanField).
    objectif_formation = models.BooleanField(default=False)
# Database field: objectif_collaboration.
# objectif_collaboration: Database field (models.BooleanField).
    objectif_collaboration = models.BooleanField(default=False)
# Database field: objectif_publication.
# objectif_publication: Database field (models.BooleanField).
    objectif_publication = models.BooleanField(default=False)
# Database field: objectif_presentation.
# objectif_presentation: Database field (models.BooleanField).
    objectif_presentation = models.BooleanField(default=False)
# Database field: objectif_autre.
# objectif_autre: Database field (models.BooleanField).
    objectif_autre = models.BooleanField(default=False)
# Database field: objectif_autre_text.
# objectif_autre_text: Database field (models.CharField).
    objectif_autre_text = models.CharField(max_length=255, null=True, blank=True)

    # ── Section 3 : Résultats ──
# resultats: Database field (models.TextField).
    resultats = models.TextField(null=True, blank=True)
# Database field: publications.
# publications: Database field (models.CharField).
    publications = models.CharField(max_length=100, null=True, blank=True)
# Database field: collaborations.
# collaborations: Database field (models.CharField).
    collaborations = models.CharField(max_length=100, null=True, blank=True)
# Database field: impact.
# impact: Database field (models.TextField).
    impact = models.TextField(null=True, blank=True)

    # ── Section 5 : Évaluation ──
# rating: Database field (models.PositiveIntegerField).
    rating = models.PositiveIntegerField(null=True, blank=True)
# Database field: points_positifs.
# points_positifs: Database field (models.TextField).
    points_positifs = models.TextField(null=True, blank=True)
# Database field: difficultes.
# difficultes: Database field (models.TextField).
    difficultes = models.TextField(null=True, blank=True)
# Database field: recommande.
# recommande: Database field (models.CharField).
    recommande = models.CharField(
        max_length=20,
        choices=RecommandationChoices.choices,
        null=True, blank=True
    )

    # ── Section 6 : Signature ──
# civilite: Database field (models.CharField).
    civilite = models.CharField(
        max_length=10,
        choices=CiviliteChoices.choices,
        null=True, blank=True
    )
# Database field: nom_complet.
# nom_complet: Database field (models.CharField).
    nom_complet = models.CharField(max_length=150, null=True, blank=True)
# Database field: date_signe.
# date_signe: Database field (models.DateField).
    date_signe = models.DateField(null=True, blank=True)

    # ── Admin ──
# valide_par: Database field (models.ForeignKey).
    valide_par = models.ForeignKey(User, on_delete=models.PROTECT, related_name='rapports', null=True, blank=True)
# Database field: date_soumission.
# date_soumission: Database field (models.DateTimeField).
    date_soumission = models.DateTimeField(null=True, blank=True)
# Database field: est_valide.
# est_valide: Database field (models.BooleanField).
    est_valide = models.BooleanField(default=False)
# Database field: commentaires_retour.
# commentaires_retour: Database field (models.TextField).
    commentaires_retour = models.TextField(null=True, blank=True)
# Database field: date_validation.
# date_validation: Database field (models.DateTimeField).
    date_validation = models.DateTimeField(null=True, blank=True)
# Database field: statut.
# statut: Database field (models.CharField).
    statut = models.CharField(
        max_length=20,
        choices=StatutRapport.choices,
        default=StatutRapport.EN_ATTENTE
    )


# Model or class: FichierRapport.
# FichierRapport: Model class for database operations.
class FichierRapport(models.Model):
# Model or class: TypeFichier.
# TypeFichier: Model class for database operations.
    class TypeFichier(models.TextChoices):
        RAPPORT = 'rapport', 'Rapport scientifique'
        ATTESTATION = 'attestation', 'Attestation de présence'
        JUSTIFICATIF = 'justificatif', 'Justificatifs de transport'
        PHOTO = 'photo', 'Photos/Visuels'
        PUBLICATION = 'publication', 'Publications/Présentations'

# Database field: rapport.
# rapport: Database field (models.ForeignKey).
    rapport = models.ForeignKey(Rapport, on_delete=models.CASCADE, related_name='fichiers')
    fichier = CloudinaryField('raw', type='upload')
# Database field: nom.
# nom: Database field (models.CharField).
    nom = models.CharField(max_length=255, null=True, blank=True)
# Database field: type_fichier.
# type_fichier: Database field (models.CharField).
    type_fichier = models.CharField(
        max_length=20,
        choices=TypeFichier.choices,
        null=True, blank=True
    )
# Database field: date_upload.
# date_upload: Database field (models.DateTimeField).
    date_upload = models.DateTimeField(auto_now_add=True)

# Model or class: Log.
# Log: Model class for database operations.
class Log(models.Model):
# Database field: demande.
# demande: Database field (models.ForeignKey).
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='logs')
# Database field: user.
# user: Database field (models.ForeignKey).
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name='logs')
# Database field: date_action.
# date_action: Database field (models.DateTimeField).
    date_action = models.DateTimeField(auto_now_add=True)
# Database field: type_action.
# type_action: Database field (models.CharField).
    type_action = models.CharField(max_length=100)
# Database field: details.
# details: Database field (models.TextField).
    details = models.TextField(null=True, blank=True)
# Database field: ancien_statut.
# ancien_statut: Database field (models.CharField).
    ancien_statut = models.CharField(
        max_length=30, 
        choices=StatutDemande.choices,
        null=True, 
        blank=True
    )
# Database field: nouveau_statut.
# nouveau_statut: Database field (models.CharField).
    nouveau_statut = models.CharField(
        max_length=30, 
        choices=StatutDemande.choices,
        null=True, 
        blank=True
    )

# Model or class: CoutDemande.
# CoutDemande: Model class for database operations.
class CoutDemande(models.Model):
# Database field: demande.
# demande: Database field (models.OneToOneField).
    demande = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='cout')
# Database field: cout.
# cout: Database field (models.FloatField).
    cout = models.FloatField()
# Database field: created_at.
# created_at: Database field (models.DateTimeField).
    created_at = models.DateTimeField(auto_now_add=True)
# Database field: updated_at.
# updated_at: Database field (models.DateTimeField).
    updated_at = models.DateTimeField(auto_now=True)

