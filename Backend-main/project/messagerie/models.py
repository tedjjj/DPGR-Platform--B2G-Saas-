
from django.db import models
from users.models import User


# Model or class: Message.

# Database models and data structure definitions for this Django app.

# Message: Model class for database operations.
class Message(models.Model):
# Database field: chercheur.
# chercheur: Database field (models.ForeignKey).
    chercheur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_envoyes', null=True, blank=True)
# Database field: email_visiteur.
# email_visiteur: Database field (models.EmailField).
    email_visiteur = models.EmailField(null=True, blank=True)
# Database field: contenu.
# contenu: Database field (models.TextField).
    contenu = models.TextField()
# Database field: est_lu.
# est_lu: Database field (models.BooleanField).
    est_lu = models.BooleanField(default=False)
# Database field: est_repondu.
# est_repondu: Database field (models.BooleanField).
    est_repondu = models.BooleanField(default=False)
# Database field: date_envoi.
# date_envoi: Database field (models.DateTimeField).
    date_envoi = models.DateTimeField(auto_now_add=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        ordering = ['-date_envoi']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"Message de {self.chercheur.nom} {self.chercheur.prenom} — {self.date_envoi:%d/%m/%Y}"


# Model or class: Reponse.
# Reponse: Model class for database operations.
class Reponse(models.Model):
# Database field: message.
# message: Database field (models.ForeignKey).
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reponses')
# Database field: assistant.
# assistant: Database field (models.ForeignKey).
    assistant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reponses_envoyees')
# Database field: contenu.
# contenu: Database field (models.TextField).
    contenu = models.TextField()
# Database field: date_reponse.
# date_reponse: Database field (models.DateTimeField).
    date_reponse = models.DateTimeField(auto_now_add=True)

# Model or class: Meta.
# Meta: Class definition.
    class Meta:
        ordering = ['date_reponse']
        verbose_name = 'Réponse'
        verbose_name_plural = 'Réponses'

# Private method: __str__.
# Special method: __str__.
    def __str__(self):
        return f"Réponse de {self.assistant.nom} — {self.date_reponse:%d/%m/%Y}"
