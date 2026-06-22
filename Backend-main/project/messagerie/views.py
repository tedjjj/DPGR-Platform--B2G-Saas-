
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Message, Reponse
from .serializers import MessageSerializer, ReponseSerializer
from users.permission import IsChercheur, IsAssistantDPGR


# Model or class: MessageViewSet.

# API views and request handlers for this Django app.

# MessageViewSet: Model class for database operations.
class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.all()

        # chercheur voit uniquement ses messages
        if user.role == 'CHERCHEUR':
            queryset = queryset.filter(chercheur=user)

        # filtrer par est_repondu
        est_repondu = self.request.query_params.get('est_repondu')
        if est_repondu is not None:
            queryset = queryset.filter(est_repondu=est_repondu.lower() == 'true')

        # filtrer par est_lu
        est_lu = self.request.query_params.get('est_lu')
        if est_lu is not None:
            queryset = queryset.filter(est_lu=est_lu.lower() == 'true')

        return queryset

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action == 'create':
            return [IsChercheur()]
        return [IsAuthenticated()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save(chercheur=self.request.user)

    @action(detail=True, methods=['post'], url_path='repondre', permission_classes=[IsAssistantDPGR])
# Method: repondre.
# Method: repondre.
    def repondre(self, request, pk=None):
        message = self.get_object()
        contenu = request.data.get('contenu', '')

        if not contenu:
            return Response(
                {"detail": "Le contenu de la réponse est obligatoire."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reponse = Reponse.objects.create(
            message=message,
            assistant=request.user,
            contenu=contenu
        )

        # marquer le message comme lu et répondu
        message.est_lu = True
        message.est_repondu = True
        message.save(update_fields=['est_lu', 'est_repondu'])

        return Response(ReponseSerializer(reponse).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='marquer-lu', permission_classes=[IsAssistantDPGR])
# Method: marquer_lu.
# Method: marquer_lu.
    def marquer_lu(self, request, pk=None):
        message = self.get_object()
        message.est_lu = True
        message.save(update_fields=['est_lu'])
        return Response(MessageSerializer(message).data, status=status.HTTP_200_OK)
