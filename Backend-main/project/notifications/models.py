
from django.db import models
from users.models import User
from demandes.models import Demande

# Model or class: Notification.

# Database models and data structure definitions for this Django app.

# Notification: Model class for database operations.
class Notification(models.Model):

    TYPE_CHOICES = [
    ('CHANGEMENT_STATUT', 'Changement de statut'),
    ('CHANGEMENT_MOT_DE_PASSE', 'Changement de mot de passe'),
    ('OUVERTURE_SESSION', 'Ouverture de session'),
    ('FERMETURE_SESSION', 'Fermeture de session'),
    ('DEMANDE_SOUMISE', 'Demande soumise'),
    ('NOUVEAU_CHERCHEUR', 'Nouveau chercheur inscrit'),
    ('PREPARATION_CS', 'Demande prête pour le CS'),
]

# Database field: destinataire.
# destinataire: Database field (models.ForeignKey).
    destinataire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
# Database field: demande.
# demande: Database field (models.ForeignKey).
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
# Database field: titre.
# titre: Database field (models.CharField).
    titre = models.CharField(max_length=255)
# Database field: message.
# message: Database field (models.TextField).
    message = models.TextField()
# Database field: type_alerte.
# type_alerte: Database field (models.CharField).
    type_alerte = models.CharField(max_length=50, choices=TYPE_CHOICES)
# Database field: est_lue.
# est_lue: Database field (models.BooleanField).
    est_lue = models.BooleanField(default=False)
# Database field: date_envoi.
# date_envoi: Database field (models.DateTimeField).
    date_envoi = models.DateTimeField(auto_now_add=True)
# Database field: date_lecture.
# date_lecture: Database field (models.DateTimeField).
    date_lecture = models.DateTimeField(null=True, blank=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        ordering = ['-date_envoi']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"{self.type_alerte} → {self.destinataire.email}"
