
from django.utils import timezone
from .models import Demande, Decision, Log, StatutDemande, CoutDemande


# Method: creer_log.

# Business logic and workflow management functions.

# Function: creer_log.
def creer_log(demande, user, type_action, ancien_statut=None, nouveau_statut=None, details=''):
    Log.objects.create(
        demande=demande,
        user=user,
        type_action=type_action,
        ancien_statut=ancien_statut,
        nouveau_statut=nouveau_statut,
        details=details,
    )


# Method: changer_statut.
# Function: changer_statut.
def changer_statut(demande, user, nouveau_statut, type_action, details=''):
    ancien_statut = demande.statut
    demande.statut = nouveau_statut
    demande.save(update_fields=['statut'])
    creer_log(demande, user, type_action, ancien_statut, nouveau_statut, details)


# Method: preparer_cs.
# Function: preparer_cs.
def preparer_cs(demande, user):
    if demande.statut != StatutDemande.VERIFICATION_AUTOMATIQUE:
        return False, "La demande doit être en vérification automatique."
    changer_statut(demande, user, StatutDemande.PREPARATION_CS,
                   'PREPARATION_CS', 'Dossier préparé pour le comité scientifique.')
    return True, None


# Method: deliberer.
# Function: deliberer.
def deliberer(demande, user):
    if demande.statut != StatutDemande.PREPARATION_CS:
        return False, "La demande doit être en préparation CS."
    changer_statut(demande, user, StatutDemande.DELIBERATION_CS,
                   'DELIBERATION', 'Demande envoyée en délibération CS.')
    return True, None


# Method: mettre_en_attente.
# Function: mettre_en_attente.
def mettre_en_attente(demande, user, raison=''):
    if demande.statut != StatutDemande.DELIBERATION_CS:
        return False, "La demande doit être en délibération CS."
    changer_statut(demande, user, StatutDemande.EN_ATTENTE,
                   'MISE_EN_ATTENTE', f'Mise en attente. Raison : {raison}')
    return True, None


# Method: terminer.
# Function: terminer.
def terminer(demande, user):
    if demande.statut != StatutDemande.APPROUVEE:
        return False, "Seule une demande approuvée peut être terminée."
    changer_statut(demande, user, StatutDemande.TERMINEE,
                   'TERMINAISON', 'Séjour terminé.')
    return True, None


# Method: cloturer.
# Function: cloturer.
def cloturer(demande, user):
    if demande.statut != StatutDemande.TERMINEE:
        return False, "La demande doit être terminée pour être clôturée."
    changer_statut(demande, user, StatutDemande.CLOTUREE,
                   'CLOTURE', 'Demande clôturée.')
    return True, None


# Method: demander_annulation.
# Function: demander_annulation.
def demander_annulation(demande, user, motif=''):
    if demande.statut != StatutDemande.APPROUVEE:
        return False, "Vous ne pouvez demander l'annulation que pour une demande approuvée."
    changer_statut(demande, user, StatutDemande.DEMANDE_ANNULATION,
                   'DEMANDE_ANNULATION', f'Demande d\'annulation. Motif : {motif}')
    return True, None


# Method: deliberer_fin.
# Function: deliberer_fin.
def deliberer_fin(demande, user):
    if demande.statut != StatutDemande.DEMANDE_ANNULATION:
        return False, "Aucune demande d'annulation en cours."
    changer_statut(demande, user, StatutDemande.DELIBERATION_CS_FIN,
                   'DELIBERATION_FIN', 'Demande d\'annulation en délibération CS.')
    return True, None

# Method: calculer_cout.
# Function: calculer_cout.
def calculer_cout(duree_jours, zone_name):
    if zone_name == 'Zone I':
        if duree_jours <= 10:
            return duree_jours * 12000
        elif duree_jours <= 29:
            return 120000 + (duree_jours - 10) * 4000
        elif duree_jours % 30 == 0:
            return (duree_jours // 30) * 200000
        else:
            mois = duree_jours // 30
            jours_restants = duree_jours - (mois * 30)
            return (mois * 200000) + (jours_restants * 6000)
    else:  # Zone 2
        if duree_jours <= 10:
            return duree_jours * 10000
        elif duree_jours <= 29:
            return 100000 + (duree_jours - 10) * 3000
        elif duree_jours % 30 == 0:
            return (duree_jours // 30) * 160000
        else:
            mois = duree_jours // 30
            jours_restants = duree_jours - (mois * 30)
            return (mois * 160000) + (jours_restants * 5000)


