
from django.utils import timezone
from .models import EligibiliteEvaluation, CritereEvaluation, ReponseCritere


# ══════════════════════════════════════════════════════════════
# SCORE 1: ÉLIGIBILITÉ (VA1 + VA2 + VA3)
# ══════════════════════════════════════════════════════════════

# Method: verifier_eligibilite.

# Business logic service layer and utility functions.

# Function: verifier_eligibilite.
def verifier_eligibilite(demande):
    from demandes.models import Demande
    demande = Demande.objects.select_related('chercheur__grade', 'type_sejour').get(id=demande.id)
    profil = demande.chercheur
    grade = profil.grade
    type_code = demande.type_sejour.code
    duree = demande.duree_jours
    eligible = True
    justification = "Éligible aux critères réglementaires."

    if not grade:
        raise ValueError("Le chercheur n'a pas de grade associé")

    if type_code == 'SPCTT':
        if profil.est_salarie and grade.nom == 'ENS':
            if profil.nombre_inscri < 2:
                eligible = False
                justification = f"Enseignant : Éligible à partir de la 2ème inscription (Actuelle: {profil.nombre_inscri})."
        elif not profil.est_salarie and grade.nom == 'DOC_NS':
            if profil.nombre_inscri < 2 or profil.nombre_inscri > 5:
                eligible = False
                justification = f"Étudiant : Éligible de la 2ème à la 5ème inscription (Actuelle: {profil.nombre_inscri})."
        else:
            eligible = False
            justification = "Le SPCTT est réservé aux doctorants (ENS ou DOC_NS)."
        if eligible and grade.nom == 'ENS' and not (15 <= duree <= 30):
            eligible = False
            justification = f"SPCTT : La durée de {duree} jours est invalide (doit être entre 15 et 30 jours)."

    elif type_code == 'SSHN':
        if grade.nom == 'MC_B':
            if profil.nombre_sejours_effectues >= 4:
                eligible = False
                justification = "MCF B : Nombre maximum de stages atteint (4 stages)."
            elif not (7 <= duree <= 15):
                eligible = False
                justification = "MCF B : La durée doit être comprise entre 7 et 15 jours."
        elif grade.nom in ['MC_A', 'PROF']:
            if duree > 7:
                eligible = False
                justification = f"{grade.nom} : La durée maximum autorisée est de 7 jours."
        else:
            eligible = False
            justification = "Le SSHN est réservé aux grades MC_B, MC_A et PROF."

    demande.eligible = eligible
    demande.recommandation_auto = justification
    demande.save()

    EligibiliteEvaluation.objects.update_or_create(
        demande=demande,
        defaults={
            'dernier_stage_valide': True,
            'nb_stages_valide': eligible,
            'resultat': 'ELIGIBLE' if eligible else 'INELIGIBLE',
            'justification': justification
        }
    )


# Method: calculer_score.
# Function: calculer_score.
def calculer_score(demande):
    from demandes.models import Demande
    demande = Demande.objects.select_related('chercheur').get(id=demande.id)
    profil = demande.chercheur
    today = timezone.now().date()

    va = profil.nombre_sejours_effectues
    va2 = profil.dernier_sejour
    va3 = profil.nb_sejours_3_dernières_années

    score_va = 10 - va if va <= 10 else 0
    score_va3 = 3 - va3 if va3 <= 3 else 0

    if va2:
        score_va2 = today.year - va2.year
        if (today.month, today.day) < (va2.month, va2.day):
            score_va2 -= 1
        score_va2 = max(0, score_va2)
    else:
        score_va2 = 0

    score_total = score_va + score_va2 + score_va3
    if score_total == 0:
        score_total = 9999999

    demande.score_total = score_total
    demande.save()

    return score_total


# ══════════════════════════════════════════════════════════════
# SCORE 2: CRITÈRES (SOMME DES POIDS VALIDÉS)
# ══════════════════════════════════════════════════════════════

# Method: executer_logique_critere.
# Function: executer_logique_critere.
def executer_logique_critere(logique, donnees):
    """
    Exécute la logique de vérification d'un critère
    
    Exemple:
    >>> executer_logique_critere(
    ...     "experience_years > 5 AND publications_count >= 3",
    ...     {"experience_years": 7, "publications_count": 5}
    ... )
    True
    """
# Error handling block.
    try:
        # Remplacer les opérateurs textuels
        logique = logique.replace(" AND ", " and ")
        logique = logique.replace(" OR ", " or ")
        logique = logique.replace(" NOT ", " not ")
        
        # Évaluer en sécurité
        resultat = eval(logique, {"__builtins__": {}}, donnees)
        return bool(resultat)
    except Exception as e:
        print(f"Erreur lors de l'exécution de la logique: {str(e)}")
        return False


# Method: verifier_et_sauvegarder_critere.
# Function: verifier_et_sauvegarder_critere.
def verifier_et_sauvegarder_critere(demande_id, critere_id, donnees_chercheur):
    """
    Vérifie un critère et sauvegarde la réponse
    """
# Error handling block.
    try:
        from demandes.models import Demande
        demande = Demande.objects.get(id=demande_id)
        critere = CritereEvaluation.objects.get(id=critere_id)
        
        # Exécuter la logique
        is_validated = executer_logique_critere(
            critere.logique_verification, 
            donnees_chercheur
        )
        
        # Message
        justification = f"{' Validé' if is_validated else ' Non validé'}: {critere.name}"
        
        # Sauvegarder
        reponse, created = ReponseCritere.objects.update_or_create(
            demande=demande,
            critere=critere,
            defaults={
                'donnees': donnees_chercheur,
                'is_validated': is_validated,
                'justification': justification
            }
        )
        
        return {
            "is_validated": is_validated,
            "justification": justification,
            "poids": critere.weight if is_validated else 0
        }
    
    except Exception as e:
        return {"error": str(e)}


# Method: calculer_score_criteres.
# Function: calculer_score_criteres.
def calculer_score_criteres(demande_id):
    """
    Calcule le score total = somme des poids des critères validés
    """
# Error handling block.
    try:
        from demandes.models import Demande
        demande = Demande.objects.get(id=demande_id)
        reponses = ReponseCritere.objects.filter(demande=demande)
        
        score_total = 0
        details = []
        
        for reponse in reponses:
            if reponse.is_validated:
                score_total += reponse.critere.weight
            
            details.append({
                "critere": reponse.critere.name,
                "weight": reponse.critere.weight,
                "validated": reponse.is_validated,
                "justification": reponse.justification
            })
        
        # Sauvegarder le score dans Demande
        demande.score_criteres = score_total
        demande.save(update_fields=['score_criteres'])
        
        return {
            "score_total": score_total,
            "details": details
        }
    
    except Exception as e:
        return {"error": str(e)}

# Method: calculer_score_final.
# Function: calculer_score_final.
def calculer_score_final(demande_id):
    """
    Calcule le score final après pondération
    """
# Error handling block.
    try:
        from demandes.models import Demande
        demande = Demande.objects.get(id=demande_id)
        
        if demande.score_total is None or demande.score_criteres is None:
            raise ValueError("Les scores de base doivent être calculés avant de calculer le score final.")
        
        
        score_final = ( demande.score_total) + ( demande.score_criteres)
        
        # Sauvegarder le score final dans Demande
        demande.score_final = score_final
        demande.save(update_fields=['score_final'])
        
        return {
            "score_final": score_final
        }
    
    except Exception as e:
        return {"error": str(e)}
    
