
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer




# Model or class: NotificationViewSet.

# API views and request handlers for this Django app.

# NotificationViewSet: Model class for database operations.
class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        queryset = Notification.objects.filter(destinataire=self.request.user)
        type_alerte = self.request.query_params.get('type')
        if type_alerte:
            queryset = queryset.filter(type_alerte=type_alerte)
        return queryset

    @action(detail=True, methods=['post'], url_path='lire')
# Method: lire.
# Method: lire.
    def lire(self, request, pk=None):
        notification = self.get_object()
        notification.est_lue = True
        notification.date_lecture = timezone.now()
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'], url_path='lire-tout')
# Method: lire_tout.
# Method: lire_tout.
    def lire_tout(self, request):
        Notification.objects.filter(
            destinataire=request.user,
            est_lue=False
        ).update(est_lue=True, date_lecture=timezone.now())
        return Response({"detail": "Toutes les notifications marquées comme lues."})
