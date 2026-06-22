
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .attestation import generer_attestation
from parametres.views import affecter_type_sejour
from .models import Demande, Document, Decision, Rapport, Log, CoutDemande, StatutDemande
from .serializers import DemandeSerializer
from users.permission import IsChercheur, IsAdminDPGR, IsSuperAdmin, IsAssistantDPGR
import uuid
from .workflow import (

# API views and request handlers for this Django app.

    preparer_cs, deliberer, mettre_en_attente,
    terminer, cloturer, demander_annulation, deliberer_fin, calculer_cout
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from evaluations.services import calculer_score_criteres, calculer_score_final, verifier_eligibilite
import cloudinary.uploader

# Model or class: DemandeViewSet.
# DemandeViewSet: Model class for database operations.
class DemandeViewSet(viewsets.ModelViewSet):
    serializer_class = DemandeSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CHERCHEUR':
            qs = Demande.objects.filter(chercheur=user.profil)
        else:
            qs = Demande.objects.all()
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        return qs.select_related(
            'chercheur__user',
            'chercheur__grade',
            'chercheur__laboratoire',
            'type_sejour',
        )
   

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsChercheur()]
            
        return [IsAuthenticated()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        numero = f"DEM-{uuid.uuid4().hex[:8].upper()}"
        data = serializer.validated_data
        date_debut = data.get('date_debut')
        date_fin = data.get('date_fin')
        duree = (date_fin - date_debut).days
        # Récupérer le chercheur et affecter le type jdida pour abdallah
        chercheur = self.request.user.profil
        type_sejour = affecter_type_sejour(chercheur.grade)
        # -------------------------modified
    
        serializer.save(
        chercheur=self.request.user.profil,
        numero_demande=numero,
        statut='BROUILLON',
        type_sejour=type_sejour,
        duree_jours=duree
    )

# Private method: _verifier_champs.
# Private helper method: _verifier_champs.
    def _verifier_champs(self, demande):
        champs_obligatoires = [
            'date_debut', 'date_fin', 'destination',
            'institution_accueil', 'ville_accueil',
            'objectifs_scientifiques', 'type_sejour',
            'session', 'pays',
        ]
        champs_manquants = []
        for champ in champs_obligatoires:
            if not getattr(demande, champ):
                champs_manquants.append(champ)
        return champs_manquants
    
# Method: verifier_eligibilite.
# Method: verifier_eligibilite.
    def verifier_eligibilite(self, demande):
        from evaluations.services import verifier_eligibilite
        verifier_eligibilite(demande)

# Method: calculer_score.
# Method: calculer_score.
    def calculer_score(self, demande):
        from evaluations.services import calculer_score
        calculer_score(demande)
    

    @action(detail=True, methods=['post'], url_path='soumettre', permission_classes=[IsChercheur])
# Method: soumettre.
# Method: soumettre.
    def soumettre(self, request, pk=None):
        demande = self.get_object()
        if demande.session.etat != "OUVERTE":
            return Response(
            {"detail": "La session est fermée : vous ne pouvez pas soumettre de demande."},
            status=status.HTTP_403_FORBIDDEN,
            )

        if demande.statut != StatutDemande.BROUILLON:
            return Response(
                {"detail": "Seule une demande en brouillon peut être soumise."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        champs_manquants = self._verifier_champs(demande)
        if champs_manquants:
            demande.statut = StatutDemande.SOUMISE
            demande.date_soumission = timezone.now()
            demande.save(update_fields=['statut', 'date_soumission'])
            Log.objects.create(
                demande=demande,
                user=request.user,
                type_action='SOUMISSION',
                ancien_statut='BROUILLON',
                nouveau_statut='SOUMISE',
                details='Demande soumise par le chercheur'
            )
            return Response(
                {"detail": "Vérification échouée.", "champs_manquants": champs_manquants},
                status=status.HTTP_400_BAD_REQUEST,
            )

        demande.date_soumission = timezone.now()
        demande.statut = StatutDemande.SOUMISE
        demande.save(update_fields=['statut', 'date_soumission'])
        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='SOUMISSION',
            ancien_statut='BROUILLON',
            nouveau_statut='SOUMISE',
            details='Demande soumise par le chercheur'
        )

        demande.statut = StatutDemande.VERIFICATION_AUTOMATIQUE
        demande.save(update_fields=['statut'])
        # jai ajouter ca 
        try:
           # 1. Vérifier l'éligibilité
           self.verifier_eligibilite(demande)
    
           # 2. Calculer le score
           self.calculer_score(demande)
           calculer_score_criteres(demande.id) #ajouter ceci pour calculer le score des critres
           calculer_score_final(demande.id) #ajouter ceci pour calculer le score final
        except Exception as e:
            Log.objects.create(
        demande=demande,
        user=request.user,
        type_action='VERIFICATION',
        ancien_statut='SOUMISE',
        nouveau_statut='VERIFICATION_AUTOMATIQUE',
        details=f'Erreur lors de la vérification: {str(e)}'
    )
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='VERIFICATION',
            ancien_statut='SOUMISE',
            nouveau_statut='VERIFICATION_AUTOMATIQUE',
            details='Vérification automatique réussie.'
        )
        cout = calculer_cout(demande.duree_jours, demande.pays.zone)
        CoutDemande.objects.update_or_create(demande=demande, defaults={'cout': cout})
        

        #  jai AJOUTE CCI : Retour à SOUMISE
        demande.statut = StatutDemande.SOUMISE
        demande.save(update_fields=['statut'])
        
        #  jai ajouter ca Log du retour à SOUMISE
        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='VERIFICATION',
            ancien_statut='VERIFICATION_AUTOMATIQUE',
            nouveau_statut='SOUMISE',
            details='Vérification automatique terminée, demande retour à SOUMISE.'
        )

        return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='annuler', permission_classes=[IsChercheur])
# Method: annuler.
# Method: annuler.
    def annuler(self, request, pk=None):
        demande = self.get_object()

        if demande.statut not in ['BROUILLON', 'SOUMISE', 'EN_ATTENTE']:
            return Response(
                {"detail": "Cette demande ne peut pas être annulée."},
                status=status.HTTP_400_BAD_REQUEST
            )

        ancien_statut = demande.statut
        demande.statut = 'ANNULEE'
        demande.save(update_fields=['statut'])

        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='ANNULATION',
            ancien_statut=ancien_statut,
            nouveau_statut='ANNULEE',
            details='Demande annulée par le chercheur'
        )

        return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='approuver', permission_classes=[IsAdminDPGR])
# Method: approuver.
# Method: approuver.
    def approuver(self, request, pk=None):
    
    
     demande = self.get_object()

     if demande.statut != 'DELIBERATION_CS':
        return Response(
            {"detail": "La demande doit être en délibération CS pour être approuvée."},
            status=status.HTTP_400_BAD_REQUEST
        )

     # Générer et uploader l'attestation
     attestation = generer_attestation(demande)
     result = cloudinary.uploader.upload(
        attestation,
        resource_type='raw',
        public_id=f"attestations/attestation_{demande.numero_demande}",
        format='pdf'
     )
     demande.attestation = result['public_id']
     demande.statut = 'APPROUVEE'
     demande.save(update_fields=['statut', 'attestation'])

     Log.objects.create(
        demande=demande,
        user=request.user,
        type_action='APPROBATION',
        ancien_statut='DELIBERATION_CS',
        nouveau_statut='APPROUVEE',
        details='Demande approuvée par le CS'
    )

     return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)
  
    @action(
        detail=True,
        methods=['patch'],
        url_path='notes-internes',
        permission_classes=[IsAdminDPGR],
    )
# Method: notes_internes.
# Method: notes_internes.
    def notes_internes(self, request, pk=None):
        """Mise à jour des notes internes pendant la délibération CS."""
        demande = self.get_object()
        if demande.statut != StatutDemande.DELIBERATION_CS:
            return Response(
                {
                    'detail': 'Les notes internes ne peuvent être modifiées que pour une demande en délibération CS.'
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        demande.notes_internes = request.data.get('notes_internes', '') or ''
        demande.save(update_fields=['notes_internes'])
        return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='changer-statut', permission_classes=[IsAdminDPGR])
# Method: changer_statut.
# Method: changer_statut.
    def changer_statut(self, request, pk=None):
        """Changer le statut de la demande (SOUMISE → DELIBERATION_CS)"""
        demande = self.get_object()
        statut = request.data.get('statut')
        
        if not statut:
            return Response(
                {"detail": "Le statut est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ancien_statut = demande.statut
        demande.statut = statut
        demande.save(update_fields=['statut'])
        
        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='CHANGEMENT_STATUT',
            ancien_statut=ancien_statut,
            nouveau_statut=statut,
            details=f'Statut changé de {ancien_statut} à {statut}'
        )
        
        return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    

    @action(detail=True, methods=['post'], url_path='rejeter', permission_classes=[IsAdminDPGR])
# Method: rejeter.
# Method: rejeter.
    def rejeter(self, request, pk=None):
        demande = self.get_object()

        if demande.statut != 'DELIBERATION_CS':
            return Response(
                {"detail": "La demande doit être en délibération CS pour être rejetée."},
                status=status.HTTP_400_BAD_REQUEST
            )

        motif = request.data.get('motif', '')
        demande.statut = 'REJETEE'
        demande.save(update_fields=['statut'])

        Decision.objects.create(
            demande=demande,
            pris_par=request.user,
            decision='REJET',
            motif_rejet=motif
        )

        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='REJET',
            ancien_statut='DELIBERATION_CS',
            nouveau_statut='REJETEE',
            details=f'Demande rejetée. Motif: {motif}'
        )

        return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)
    @action(detail=True, methods=['post'], url_path='preparer-cs', permission_classes=[IsAssistantDPGR])
# Method: action_preparer_cs.
# Method: action_preparer_cs.
    def action_preparer_cs(self, request, pk=None):
      demande = self.get_object()
      ok, erreur = preparer_cs(demande, request.user)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='deliberer', permission_classes=[IsAdminDPGR])
# Method: action_deliberer.
# Method: action_deliberer.
    def action_deliberer(self, request, pk=None):
      demande = self.get_object()
      ok, erreur = deliberer(demande, request.user)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='mettre-en-attente', permission_classes=[IsAdminDPGR])
# Method: action_mettre_en_attente.
# Method: action_mettre_en_attente.
    def action_mettre_en_attente(self, request, pk=None):
      demande = self.get_object()
      raison = request.data.get('raison', '')
      ok, erreur = mettre_en_attente(demande, request.user, raison)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='terminer', permission_classes=[IsChercheur])
# Method: action_terminer.
# Method: action_terminer.
    def action_terminer(self, request, pk=None):
      demande = self.get_object()
      ok, erreur = terminer(demande, request.user)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='cloturer', permission_classes=[IsAdminDPGR])
# Method: action_cloturer.
# Method: action_cloturer.
    def action_cloturer(self, request, pk=None):
      demande = self.get_object()
      ok, erreur = cloturer(demande, request.user)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='demander-annulation', permission_classes=[IsChercheur])
# Method: action_demander_annulation.
# Method: action_demander_annulation.
    def action_demander_annulation(self, request, pk=None):
      demande = self.get_object()
      motif = request.data.get('motif', '')
      ok, erreur = demander_annulation(demande, request.user, motif)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='deliberer-fin', permission_classes=[IsAdminDPGR])
# Method: action_deliberer_fin.
# Method: action_deliberer_fin.
    def action_deliberer_fin(self, request, pk=None):
      demande = self.get_object()
      ok, erreur = deliberer_fin(demande, request.user)
      if not ok:
        return Response({"detail": erreur}, status=status.HTTP_400_BAD_REQUEST)
      return Response(DemandeSerializer(demande).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
# Method: liste_rapports.
# Handler for retrieving records: liste_rapports.
def liste_rapports(request):
     from .models import Rapport
     from .serializers import RapportSerializer
     user = request.user
     if user.role == 'CHERCHEUR':
        rapports = Rapport.objects.filter(demande__chercheur=user.profil)
     else:
        rapports = Rapport.objects.all()
     return Response(RapportSerializer(rapports, many=True).data)
    
    
