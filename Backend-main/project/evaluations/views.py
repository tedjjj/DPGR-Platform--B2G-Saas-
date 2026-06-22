
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from datetime import date
from parametres.models import Session
from demandes.models import Demande
from .models import GrilleEvaluation, CritereEvaluation, EligibiliteEvaluation , ReponseCritere
from .serialzers import GrilleEvaluationSerializer, CritereEvaluationSerializer, EligibiliteEvaluationSerializer
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .services import verifier_et_sauvegarder_critere, calculer_score_criteres



# ============================================================================
# GET / PUT / POST /api/sessions/{id}/grille-eval/
# ============================================================================

# API views and request handlers for this Django app.

# SessionGrilleView: API view handler for incoming requests.
class SessionGrilleView(APIView):

# Method: get.
# Method: get.
    def get(self, request, session_id):
        """Récupérer la grille d'une session"""
# Error handling block.
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if not session.grille_evaluation:
            return Response({'error': 'Aucune grille associée à cette session'}, status=status.HTTP_404_NOT_FOUND)

        serializer = GrilleEvaluationSerializer(session.grille_evaluation)
        return Response(serializer.data)

# Method: post.
# Method: post.
    def post(self, request, session_id):
        """Créer une nouvelle grille et l'associer à la session"""
# Error handling block.
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if session.grille_evaluation:
            return Response({'error': 'Cette session a déjà une grille'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = GrilleEvaluationSerializer(data=request.data)
        if serializer.is_valid():
            grille = serializer.save()
            session.grille_evaluation = grille
            session.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Method: put.
# Method: put.
    def put(self, request, session_id):
        """Activer ou désactiver la grille d'une session"""
# Error handling block.
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if not session.grille_evaluation:
            return Response({'error': 'Aucune grille associée à cette session'}, status=status.HTTP_404_NOT_FOUND)

        grille = session.grille_evaluation
        grille.is_active = request.data.get('is_active', grille.is_active)
        grille.save()

        return Response({'message': f'Grille {"activée" if grille.is_active else "désactivée"}'})


# ============================================================================
# POST /api/sessions/{id}/criteres/
# ============================================================================
# SessionCritereView: API view handler for incoming requests.
class SessionCritereView(APIView):

# Method: get.
# Method: get.
    def get(self, request, session_id):
        """Récupérer tous les critères d'une session"""
# Error handling block.
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if not session.grille_evaluation:
            return Response({'error': 'Aucune grille associée à cette session'}, status=status.HTTP_404_NOT_FOUND)

        criteres = session.grille_evaluation.criteres.all()
        serializer = CritereEvaluationSerializer(criteres, many=True)
        return Response(serializer.data)
        

# Method: post.
# Method: post.
    def post(self, request, session_id):
        """Ajouter un critère à la grille de la session"""
# Error handling block.
        try:
            session = Session.objects.get(id=session_id)
        except Session.DoesNotExist:
            return Response({'error': 'Session introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if not session.grille_evaluation:
            return Response({'error': 'Aucune grille associée à cette session'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['grille'] = session.grille_evaluation.id

        serializer = CritereEvaluationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# PATCH / DELETE /api/sessions/{id}/criteres/{critere_id}/
# ============================================================================
# SessionCritereDetailView: API view handler for incoming requests.
class SessionCritereDetailView(APIView):

# Method: patch.
# Method: patch.
    def patch(self, request, session_id, critere_id):
        """Modifier partiellement un critère (name, description, weight)"""
# Error handling block.
        try:
            critere = CritereEvaluation.objects.get(id=critere_id, grille__sessions__id=session_id)
        except CritereEvaluation.DoesNotExist:
            return Response({'error': 'Critère introuvable'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CritereEvaluationSerializer(critere, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Method: delete.
# Handler for deleting records: delete.
    def delete(self, request, session_id, critere_id):
        """Supprimer un critère"""
# Error handling block.
        try:
            critere = CritereEvaluation.objects.get(id=critere_id, grille__sessions__id=session_id)
        except CritereEvaluation.DoesNotExist:
            return Response({'error': 'Critère introuvable'}, status=status.HTTP_404_NOT_FOUND)

        critere.delete()
        return Response({'message': 'Critère supprimé'}, status=status.HTTP_204_NO_CONTENT)



# ────────────────────────────────────────────────────────────
# POST /api/demandes/{demande_id}/reponses-criteres/
# Chercheur soumet les données pour un critère
# ────────────────────────────────────────────────────────────
# ReponsesCriteresView: API view handler for incoming requests.
class ReponsesCriteresView(APIView):
    permission_classes = [IsAuthenticated]
    
# Method: post.
# Method: post.
    def post(self, request, demande_id):
        
# Error handling block.
        try:
            critere_id = request.data.get('critere_id')
            donnees = request.data.get('donnees', {})
            
            if not critere_id or not donnees:
                return Response(
                    {"error": "critere_id et donnees sont requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Vérifier et sauvegarder
            resultat = verifier_et_sauvegarder_critere(demande_id, critere_id, donnees)
            
            if "error" in resultat:
                return Response(resultat, status=status.HTTP_404_NOT_FOUND)
            
            # Recalculer le score total
            score = calculer_score_criteres(demande_id)
            
            return Response({
                "critere_id": critere_id,
                "is_validated": resultat["is_validated"],
                "justification": resultat["justification"],
                "poids": resultat["poids"],
                "score_total": score["score_total"]
            }, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
# Method: get.
# Method: get.
    def get(self, request, demande_id):
        """
        Récupérer toutes les réponses aux critères pour une demande
        """
# Error handling block.
        try:
            reponses = ReponseCritere.objects.filter(demande_id=demande_id)
            
            data = []
            for reponse in reponses:
                data.append({
                    "id": reponse.id,
                    "critere_id": reponse.critere.id,
                    "critere_name": reponse.critere.name,
                    "weight": reponse.critere.weight,
                    "donnees": reponse.donnees,
                    "is_validated": reponse.is_validated,
                    "justification": reponse.justification,
                    "date_reponse": reponse.date_reponse
                })
            
            return Response(data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ────────────────────────────────────────────────────────────
# GET /api/demandes/{demande_id}/score-criteres/
# Récupérer le score total calculé
# ────────────────────────────────────────────────────────────
# ScoreCriteresView: API view handler for incoming requests.
class ScoreCriteresView(APIView):
    permission_classes = [IsAuthenticated]
    
# Method: get.
# Method: get.
    def get(self, request, demande_id):
        """
        Récupérer le score total des critères
        """
# Error handling block.
        try:
            score = calculer_score_criteres(demande_id)
            
            if "error" in score:
                return Response(score, status=status.HTTP_404_NOT_FOUND)
            
            return Response(score)
        
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
