
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Demande, Rapport, FichierRapport, Log
from .serializers import RapportSerializer
from users.permission import IsChercheur, IsAdminDPGR


# Method: to_bool.

# Utility functions and helper code.

# Function: to_bool.
def to_bool(value):
    return str(value).lower() in ['true', '1', 'yes']


# Model or class: RapportViewSet.
# RapportViewSet: Model class for database operations.
class RapportViewSet(viewsets.ModelViewSet):
    serializer_class = RapportSerializer
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'post', 'delete']

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        user = self.request.user

        # Si appelé via nested router /api/demandes/{demande_pk}/rapport/
        demande_pk = self.kwargs.get('demande_pk')
        if demande_pk:
            return Rapport.objects.filter(demande_id=demande_pk)

        # Si appelé via /api/demandes/rapports/
        if user.role == 'CHERCHEUR':
            return Rapport.objects.filter(demande__chercheur=user.profil)
        return Rapport.objects.all()

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action == 'soumettre':
            return [IsChercheur()]
        elif self.action in ['valider', 'demander_correction']:
            return [IsAdminDPGR()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], url_path='soumettre', permission_classes=[IsChercheur])
# Method: soumettre.
# Method: soumettre.
    def soumettre(self, request, demande_pk=None):
        if not demande_pk:
            return Response({"detail": "L'ID de la demande est requis dans l'URL."}, status=status.HTTP_400_BAD_REQUEST)

# Error handling block.
        try:
            demande = Demande.objects.get(pk=demande_pk, chercheur=request.user.profil)
        except Demande.DoesNotExist:
            return Response({"detail": "Demande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if Rapport.objects.filter(demande=demande).exists():
            return Response({"detail": "Un rapport existe déjà pour cette demande."}, status=status.HTTP_400_BAD_REQUEST)

        rapport_file = request.FILES.get('rapportFile')
        attestation_file = request.FILES.get('attestationFile')

        if not rapport_file:
            return Response({"detail": "Le rapport scientifique final est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)
        if not attestation_file:
            return Response({"detail": "L'attestation de présence est obligatoire."}, status=status.HTTP_400_BAD_REQUEST)

        rapport = Rapport.objects.create(
            demande=demande,
            date_soumission=timezone.now(),
            statut=Rapport.StatutRapport.EN_ATTENTE,
            date_depart_reelle=request.data.get('date_depart_reelle'),
            date_retour_reelle=request.data.get('date_retour_reelle'),
            description=request.data.get('description'),
            objectif_formation=to_bool(request.data.get('objectif_formation', False)),
            objectif_collaboration=to_bool(request.data.get('objectif_collaboration', False)),
            objectif_publication=to_bool(request.data.get('objectif_publication', False)),
            objectif_presentation=to_bool(request.data.get('objectif_presentation', False)),
            objectif_autre=to_bool(request.data.get('objectif_autre', False)),
            objectif_autre_text=request.data.get('objectif_autre_text', ''),
            resultats=request.data.get('resultats'),
            publications=request.data.get('publications'),
            collaborations=request.data.get('collaborations'),
            impact=request.data.get('impact'),
            rating=request.data.get('rating'),
            points_positifs=request.data.get('points_positifs'),
            difficultes=request.data.get('difficultes'),
            recommande=request.data.get('recommande'),
            civilite=request.data.get('civilite'),
            nom_complet=request.data.get('nom_complet'),
            date_signe=request.data.get('date_signe'),
        )

        FichierRapport.objects.create(
            rapport=rapport,
            fichier=rapport_file,
            nom=rapport_file.name,
            type_fichier=FichierRapport.TypeFichier.RAPPORT
        )
        FichierRapport.objects.create(
            rapport=rapport,
            fichier=attestation_file,
            nom=attestation_file.name,
            type_fichier=FichierRapport.TypeFichier.ATTESTATION
        )

        fichiers_optionnels = {
            'justificatifsFile': FichierRapport.TypeFichier.JUSTIFICATIF,
            'photosFile': FichierRapport.TypeFichier.PHOTO,
            'publicationsFile': FichierRapport.TypeFichier.PUBLICATION,
        }
        for key, type_fichier in fichiers_optionnels.items():
            fichier = request.FILES.get(key)
            if fichier:
                FichierRapport.objects.create(
                    rapport=rapport,
                    fichier=fichier,
                    nom=fichier.name,
                    type_fichier=type_fichier
                )

        Log.objects.create(
            demande=demande,
            user=request.user,
            type_action='SOUMISSION_RAPPORT',
            details='Rapport soumis par le chercheur'
        )

        return Response(RapportSerializer(rapport).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='valider', permission_classes=[IsAdminDPGR])
# Method: valider.
# Method: valider.
    def valider(self, request, pk=None, demande_pk=None):
        rapport = self.get_object()

        if rapport.statut != Rapport.StatutRapport.EN_ATTENTE:
            return Response({"detail": "Le rapport doit être en attente pour être validé."}, status=status.HTTP_400_BAD_REQUEST)

        rapport.statut = Rapport.StatutRapport.VALIDE
        rapport.est_valide = True
        rapport.valide_par = request.user
        rapport.date_validation = timezone.now()
        rapport.save()

        Log.objects.create(
            demande=rapport.demande,
            user=request.user,
            type_action='VALIDATION_RAPPORT',
            details="Rapport validé par l'admin"
        )

        return Response(RapportSerializer(rapport).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='demander-correction', permission_classes=[IsAdminDPGR])
# Method: demander_correction.
# Method: demander_correction.
    def demander_correction(self, request, pk=None, demande_pk=None):
        rapport = self.get_object()

        if rapport.statut != Rapport.StatutRapport.EN_ATTENTE:
            return Response({"detail": "Le rapport doit être en attente."}, status=status.HTTP_400_BAD_REQUEST)

        commentaires = request.data.get('commentaires', '')
        if not commentaires:
            return Response({"detail": "Les commentaires sont requis."}, status=status.HTTP_400_BAD_REQUEST)

        rapport.statut = Rapport.StatutRapport.A_CORRIGER
        rapport.commentaires_retour = commentaires
        rapport.save()

        Log.objects.create(
            demande=rapport.demande,
            user=request.user,
            type_action='CORRECTION_RAPPORT',
            details=f'Correction demandée. Commentaires: {commentaires}'
        )

        return Response(RapportSerializer(rapport).data, status=status.HTTP_200_OK)
