
from django.db.models.signals import post_save, post_delete
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from demandes.models import Demande, Document
from users.models import User, ProfilChercheur
from parametres.models import Session
from .models import Log


# ── Connexion / Déconnexion ──

# Django signals for handling model state changes and side effects.

@receiver(user_logged_in)
# Method: log_login.
# Function: log_login.
def log_login(sender, request, user, **kwargs):
    Log.objects.create(
        user=user,
        action='LOGIN',
        details=f'Connexion de {user.email}',
        ip_address=request.META.get('REMOTE_ADDR'),
    )

@receiver(user_logged_out)
# Method: log_logout.
# Function: log_logout.
def log_logout(sender, request, user, **kwargs):
    if user:
        Log.objects.create(
            user=user,
            action='LOGOUT',
            details=f'Déconnexion de {user.email}',
            ip_address=request.META.get('REMOTE_ADDR'),
        )


# ── Demandes ──
@receiver(post_save, sender=Demande)
# Method: log_demande.
# Function: log_demande.
def log_demande(sender, instance, created, **kwargs):
    if created:
        Log.objects.create(
            user=instance.chercheur.user,
            action='CREATION_DEMANDE',
            details=f'Demande {instance.numero_demande} créée',
        )
    else:
        if instance.statut == 'SOUMIS':
            Log.objects.create(
                user=instance.chercheur.user,
                action='SOUMISSION_DEMANDE',
                details=f'Demande {instance.numero_demande} soumise',
            )
        elif instance.statut == 'APPROUVE':
            Log.objects.create(
                user=instance.chercheur.user,
                action='APPROBATION_DEMANDE',
                details=f'Demande {instance.numero_demande} approuvée',
            )
        elif instance.statut == 'REJETE':
            Log.objects.create(
                user=instance.chercheur.user,
                action='REJET_DEMANDE',
                details=f'Demande {instance.numero_demande} rejetée',
            )


# ── Documents ──
@receiver(post_save, sender=Document)
# Method: log_ajout_document.
# Function: log_ajout_document.
def log_ajout_document(sender, instance, created, **kwargs):
    if created:
        Log.objects.create(
            user=instance.demande.chercheur.user,
            action='AJOUT_DOCUMENT',
            details=f'Document ajouté à la demande {instance.demande.numero_demande}',
        )

@receiver(post_delete, sender=Document)
# Method: log_suppression_document.
# Function: log_suppression_document.
def log_suppression_document(sender, instance, **kwargs):
    Log.objects.create(
        user=instance.demande.chercheur.user,
        action='SUPPRESSION_DOCUMENT',
        details=f'Document supprimé de la demande {instance.demande.numero_demande}',
    )


# ── Profil ──
@receiver(post_save, sender=ProfilChercheur)
# Method: log_modification_profil.
# Function: log_modification_profil.
def log_modification_profil(sender, instance, created, **kwargs):
    if not created:
        Log.objects.create(
            user=instance.user,
            action='MODIFICATION_PROFIL',
            details=f'Profil modifié par {instance.user.email}',
        )


# ── Utilisateurs ──
@receiver(post_save, sender=User)
# Method: log_utilisateur.
# Function: log_utilisateur.
def log_utilisateur(sender, instance, created, **kwargs):
    if created:
        Log.objects.create(
            user=instance,
            action='AJOUT_UTILISATEUR',
            details=f'Utilisateur {instance.email} créé',
        )
    else:
        Log.objects.create(
            user=instance,
            action='MODIFICATION_UTILISATEUR',
            details=f'Utilisateur {instance.email} modifié',
        )


# ── Sessions ──
@receiver(post_save, sender=Session)
# Method: log_session.
# Function: log_session.
def log_session(sender, instance, created, **kwargs):
    if not created:
        if instance.etat == 'OUVERTE':
            Log.objects.create(
                user=None,
                action='OUVERTURE_SESSION',
                details=f'Session {instance.annee_academique} ouverte',
            )
        elif instance.etat == 'FERMEE':
            Log.objects.create(
                user=None,
                action='FERMETURE_SESSION',
                details=f'Session {instance.annee_academique} fermée',
            )
