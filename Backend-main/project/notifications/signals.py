
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from demandes.models import Demande
from parametres.models import Session
from users.models import User, ProfilChercheur
from .models import Notification


# ── Signal 1 : Changement de statut d'une demande → notifier le chercheur ──

# Django signals for handling model state changes and side effects.

@receiver(pre_save, sender=Demande)
# Method: notifier_changement_statut.
# Function: notifier_changement_statut.
def notifier_changement_statut(sender, instance, **kwargs):
# Error handling block.
    try:
        ancien = Demande.objects.get(pk=instance.pk)
        if ancien.statut != instance.statut:
            Notification.objects.create(
                destinataire=instance.chercheur.user,
                demande=instance,
                titre=f'Statut de votre demande {instance.numero_demande} mis à jour',
                message=f'Votre demande est passée de {ancien.statut} à {instance.statut}.',
                type_alerte='CHANGEMENT_STATUT'
            )
    except Demande.DoesNotExist:
        pass


# ── Signal 2 : Demande soumise → notifier les assistants ──
@receiver(pre_save, sender=Demande)
# Method: notifier_assistant_demande_soumise.
# Function: notifier_assistant_demande_soumise.
def notifier_assistant_demande_soumise(sender, instance, **kwargs):
# Error handling block.
    try:
        ancien = Demande.objects.get(pk=instance.pk)
        if ancien.statut != instance.statut and instance.statut == 'SOUMISE':
            assistants = User.objects.filter(role='ASSISTANT_DPGR')
            notifications = [
                Notification(
                    destinataire=assistant,
                    demande=instance,
                    titre='Nouvelle demande soumise',
                    message=f'La demande {instance.numero_demande} a été soumise par {instance.chercheur.user.nom} {instance.chercheur.user.prenom}.',
                    type_alerte='DEMANDE_SOUMISE'
                )
                for assistant in assistants
            ]
            Notification.objects.bulk_create(notifications)
    except Demande.DoesNotExist:
        pass


# ── Signal 3 : Nouveau chercheur inscrit → notifier assistants + admins ──
@receiver(post_save, sender=ProfilChercheur)
# Method: notifier_assistant_nouveau_chercheur.
# Function: notifier_assistant_nouveau_chercheur.
def notifier_assistant_nouveau_chercheur(sender, instance, created, **kwargs):
    if created:
        destinataires = User.objects.filter(role__in=['ASSISTANT_DPGR', 'ADMIN_DPGR'])
        notifications = [
            Notification(
                destinataire=user,
                demande=None,
                titre='Nouveau chercheur inscrit',
                message=f'{instance.user.nom} {instance.user.prenom} vient de s\'inscrire.',
                type_alerte='NOUVEAU_CHERCHEUR'
            )
            for user in destinataires
        ]
        Notification.objects.bulk_create(notifications)


# ── Signal 4 : Changement de mot de passe → user lui-même + assistants + admins ──
@receiver(post_save, sender=User)
# Method: notifier_changement_mot_de_passe.
# Function: notifier_changement_mot_de_passe.
def notifier_changement_mot_de_passe(sender, instance, created, **kwargs):
    if not created:
        Notification.objects.create(
            destinataire=instance,
            demande=None,
            titre='Mot de passe modifié',
            message='Votre mot de passe a été modifié avec succès.',
            type_alerte='CHANGEMENT_MOT_DE_PASSE'
        )
        if instance.role == 'CHERCHEUR':
            destinataires = User.objects.filter(role__in=['ASSISTANT_DPGR', 'ADMIN_DPGR'])
            notifications = [
                Notification(
                    destinataire=user,
                    demande=None,
                    titre='Changement de mot de passe',
                    message=f'{instance.nom} {instance.prenom} a modifié son mot de passe.',
                    type_alerte='CHANGEMENT_MOT_DE_PASSE'
                )
                for user in destinataires
            ]
            Notification.objects.bulk_create(notifications)


# ── Signal 5 : Ouverture / Fermeture de session → chercheurs + assistants + admins ──
@receiver(pre_save, sender=Session)
# Method: notifier_changement_session.
# Function: notifier_changement_session.
def notifier_changement_session(sender, instance, **kwargs):
# Error handling block.
    try:
        ancienne = Session.objects.get(pk=instance.pk)

        if not ancienne.est_ouverte and  instance.est_ouverte:
            type_alerte = 'OUVERTURE_SESSION'
            titre = 'Nouvelle session ouverte'
            message = 'Une nouvelle session est maintenant ouverte.'
        elif ancienne.est_fermee and not instance.est_ouverte:
            type_alerte = 'FERMETURE_SESSION'
            titre = 'Session fermée'
            message = 'La session est maintenant fermée.'
        else:
            return

        destinataires = User.objects.filter(role__in=['CHERCHEUR', 'ASSISTANT_DPGR', 'ADMIN_DPGR'])
        notifications = [
            Notification(
                destinataire=user,
                demande=None,
                titre=titre,
                message=message,
                type_alerte=type_alerte
            )
            for user in destinataires
        ]
        Notification.objects.bulk_create(notifications)

    except Session.DoesNotExist:
        pass


# ── Signal 6 : Demande en PREPARATION_CS → notifier les admins ──
@receiver(pre_save, sender=Demande)
# Method: notifier_admin_preparation_cs.
# Function: notifier_admin_preparation_cs.
def notifier_admin_preparation_cs(sender, instance, **kwargs):
# Error handling block.
    try:
        ancien = Demande.objects.get(pk=instance.pk)
        if ancien.statut != instance.statut and instance.statut == 'PREPARATION_CS':
            admins = User.objects.filter(role='ADMIN_DPGR')
            notifications = [
                Notification(
                    destinataire=admin,
                    demande=instance,
                    titre='Demande prête pour le CS',
                    message=f'La demande {instance.numero_demande} de {instance.chercheur.user.nom} {instance.chercheur.user.prenom} est prête pour le comité scientifique.',
                    type_alerte='PREPARATION_CS'
                )
                for admin in admins
            ]
            Notification.objects.bulk_create(notifications)
    except Demande.DoesNotExist:
        pass
