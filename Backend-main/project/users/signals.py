
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, ProfilChercheur


# Django signals for handling model state changes and side effects.

@receiver(post_save, sender=User)
# Method: create_profil_chercheur.
# Handler for creating new records: create_profil_chercheur.
def create_profil_chercheur(sender, instance, created, **kwargs):
    if created and instance.role == 'CHERCHEUR':
        ProfilChercheur.objects.create(user=instance)
