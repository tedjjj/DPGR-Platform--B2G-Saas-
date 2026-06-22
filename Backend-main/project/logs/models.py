
from django.db import models
from users.models import User

# Model or class: Log.

# Database models and data structure definitions for this Django app.

# Log: Model class for database operations.
class Log(models.Model):
    ACTION_CHOICES = [
        # Authentification
        ('LOGIN', 'Connexion'),
        ('LOGOUT', 'Déconnexion'),
        ('CHANGE_PASSWORD', 'Changement mot de passe'),
        
        # Demandes
        ('CREATION_DEMANDE', 'Création demande'),
        ('MODIFICATION_DEMANDE', 'Modification demande'),
        ('SOUMISSION_DEMANDE', 'Soumission demande'),
        ('APPROBATION_DEMANDE', 'Approbation demande'),
        ('REJET_DEMANDE', 'Rejet demande'),
        ('ANNULATION_DEMANDE', 'Annulation demande'),
        
        # Documents
        ('AJOUT_DOCUMENT', 'Ajout document'),
        ('SUPPRESSION_DOCUMENT', 'Suppression document'),
        
        # Profil
        ('MODIFICATION_PROFIL', 'Modification profil'),
        
        # Paramètres (super admin)
        ('AJOUT_UTILISATEUR', 'Ajout utilisateur'),
        ('MODIFICATION_UTILISATEUR', 'Modification utilisateur'),
        ('SUPPRESSION_UTILISATEUR', 'Suppression utilisateur'),
        ('AJOUT_PAYS', 'Ajout pays'),
        ('AJOUT_SESSION', 'Ajout session'),
        ('OUVERTURE_SESSION', 'Ouverture session'),
        ('FERMETURE_SESSION', 'Fermeture session'),
    ]

# Database field: user.
# user: Database field (models.ForeignKey).
    user = models.ForeignKey(
        User,
# Database field: on_delete.
# on_delete: Database field (models.SET_NULL,).
        on_delete=models.SET_NULL,
        null=True,
        related_name='logs_global'
    )
# Database field: action.
# action: Database field (models.CharField).
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
# Database field: details.
# details: Database field (models.TextField).
    details = models.TextField(blank=True, null=True)
# Database field: ip_address.
# ip_address: Database field (models.GenericIPAddressField).
    ip_address = models.GenericIPAddressField(null=True, blank=True)
# Database field: date_action.
# date_action: Database field (models.DateTimeField).
    date_action = models.DateTimeField(auto_now_add=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        ordering = ['-date_action']

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"{self.user} - {self.action} - {self.date_action}"
