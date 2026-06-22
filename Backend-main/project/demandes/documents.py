
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Document, Demande, Log, StatutDemande
from .serializers import DocumentSerializer
from users.permission import IsChercheur


# Model or class: DocumentViewSet.

# Utility functions and helper code.

# DocumentViewSet: Model class for database operations.
class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        return Document.objects.filter(demande_id=self.kwargs['demande_pk'])

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsChercheur()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        demande = Demande.objects.get(pk=self.kwargs['demande_pk'])

        if demande.statut != StatutDemande.BROUILLON:
            raise PermissionDenied("Vous ne pouvez ajouter un document qu'en brouillon.")

        serializer.save(demande=demande)

        fichier = serializer.instance.fichier
        details = f'Document ajouté : {fichier.public_id}' if fichier else 'Document ajouté sans fichier'

        Log.objects.create(
            demande=demande,
            user=self.request.user,
            type_action='AJOUT_DOCUMENT',
            details=details
        )

# Method: perform_destroy.
# Method: perform_destroy.
    def perform_destroy(self, instance):
        if instance.demande.statut != StatutDemande.BROUILLON:
            raise PermissionDenied("Vous ne pouvez supprimer un document qu'en brouillon.")

        fichier = instance.fichier
        details = f'Document supprimé : {fichier.public_id}' if fichier else 'Document supprimé sans fichier'

        Log.objects.create(
            demande=instance.demande,
            user=self.request.user,
            type_action='SUPPRESSION_DOCUMENT',
            details=details
        )
        instance.delete()
