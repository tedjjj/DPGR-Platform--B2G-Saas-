
from django.shortcuts import render
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Zone, pays, Grade, typeSejour, Session, Laboratoire
from .serializers import (

# API views and request handlers for this Django app.

    ZoneGeographiqueSerializer, PaysSerializer,
    GradeSerializer, TypeSejourSerializer,
    SessionSerializer, LaboratoireSerializer
)
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from .permissions import IsAssistantDPGR, isAUTHandREADONLYorSADMIN, isSuperAdminOrAssistant, IsSuperAdmin


# Method: affecter_type_sejour.
# Function: affecter_type_sejour.
def affecter_type_sejour(grade):
    from .models import typeSejour
    if grade.nom in ['DOC_NS', 'ENS']:
        return typeSejour.objects.get(code='SPCTT')
    else:
        return typeSejour.objects.get(code='SSHN')


# Model or class: ZoneGeographiqueViewSet.
# ZoneGeographiqueViewSet: Model class for database operations.
class ZoneGeographiqueViewSet(viewsets.ModelViewSet):
    serializer_class = ZoneGeographiqueSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        data = cache.get('zones_list')
        if not data:
            data = Zone.objects.all().order_by("name")
            cache.set('zones_list', data, timeout=3600)
        return data

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save()
        cache.delete('zones_list')

# Method: perform_update.
# Handler for updating records: perform_update.
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('zones_list')

# Method: perform_destroy.
# Method: perform_destroy.
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('zones_list')


# Model or class: PaysViewSet.
# PaysViewSet: Model class for database operations.
class PaysViewSet(viewsets.ModelViewSet):
    serializer_class = PaysSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        data = cache.get('pays_list')
        if not data:
            data = pays.objects.select_related("zone").all().order_by("name")
            cache.set('pays_list', data, timeout=3600)
        return data

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save()
        cache.delete('pays_list')

# Method: perform_update.
# Handler for updating records: perform_update.
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('pays_list')

# Method: perform_destroy.
# Method: perform_destroy.
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('pays_list')


# Model or class: GradeViewSet.
# GradeViewSet: Model class for database operations.
class GradeViewSet(viewsets.ModelViewSet):
    serializer_class = GradeSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        data = cache.get('grades_list')
        if not data:
            data = Grade.objects.all().order_by("id")
            cache.set('grades_list', data, timeout=3600)
        return data

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save()
        cache.delete('grades_list')

# Method: perform_update.
# Handler for updating records: perform_update.
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('grades_list')

# Method: perform_destroy.
# Method: perform_destroy.
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('grades_list')


# Model or class: TypeSejourViewSet.
# TypeSejourViewSet: Model class for database operations.
class TypeSejourViewSet(viewsets.ModelViewSet):
    serializer_class = TypeSejourSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        data = cache.get('type_sejour_list')
        if not data:
            data = typeSejour.objects.all().order_by("code")
            cache.set('type_sejour_list', data, timeout=3600)
        return data

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save()
        cache.delete('type_sejour_list')

# Method: perform_update.
# Handler for updating records: perform_update.
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('type_sejour_list')

# Method: perform_destroy.
# Method: perform_destroy.
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('type_sejour_list')


# Model or class: LaboratoireViewSet.
# LaboratoireViewSet: Model class for database operations.
class LaboratoireViewSet(viewsets.ModelViewSet):
    serializer_class = LaboratoireSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        data = cache.get('laboratoires_list')
        if not data:
            data = Laboratoire.objects.all().order_by("name")
            cache.set('laboratoires_list', data, timeout=3600)
        return data

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsSuperAdmin()]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save()
        cache.delete('laboratoires_list')

# Method: perform_update.
# Handler for updating records: perform_update.
    def perform_update(self, serializer):
        serializer.save()
        cache.delete('laboratoires_list')

# Method: perform_destroy.
# Method: perform_destroy.
    def perform_destroy(self, instance):
        instance.delete()
        cache.delete('laboratoires_list')


# Model or class: SessionViewSet.
# SessionViewSet: Model class for database operations.
class SessionViewSet(viewsets.ModelViewSet):
    serializer_class = SessionSerializer

# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        return Session.objects.all().order_by("-annee_academique")

# Getter method: get_permissions.
# Getter function: get_permissions.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [isAUTHandREADONLYorSADMIN]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperAdmin]
        elif self.action in ['open_session', 'close_session']:
            permission_classes = [IsAssistantDPGR]
        else:
            permission_classes = [IsSuperAdmin]
        return [p() for p in permission_classes]

    @action(detail=True, methods=["get"], url_path="check-auto")
# Method: check_auto.
# Method: check_auto.
    def check_auto(self, request, pk=None):
        session = self.get_object()
        if session.doit_ouvrir:
            if Session.objects.filter(etat="OUVERTE").exclude(pk=session.pk).exists():
                return Response(
                    {"detail": "Une autre session est déjà ouverte. Fermez-la d'abord."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            session.etat = "OUVERTE"
            session.save(update_fields=["etat"])
            return Response(
                {"detail": "Session ouverte automatiquement.", "etat": session.etat},
                status=status.HTTP_200_OK
            )
        if session.doit_fermer:
            session.etat = "FERMEE"
            session.save(update_fields=["etat"])
            return Response(
                {"detail": "Session fermée automatiquement.", "etat": session.etat},
                status=status.HTTP_200_OK
            )
        return Response(
            {"detail": "Aucun changement automatique nécessaire.", "etat": session.etat},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"], url_path="open")
# Method: open_session.
# Method: open_session.
    def open_session(self, request, pk=None):
        session = self.get_object()
        if session.etat == "OUVERTE":
            return Response({"detail": "Session déjà ouverte."}, status=status.HTTP_400_BAD_REQUEST)
        if Session.objects.filter(etat="OUVERTE").exclude(pk=session.pk).exists():
            return Response(
                {"detail": "Une autre session est déjà OUVERTE. Fermez-la avant d'ouvrir celle-ci."},
                status=status.HTTP_400_BAD_REQUEST
            )
        session.etat = "OUVERTE"
        session.save(update_fields=["etat"])
        return Response(SessionSerializer(session).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="close")
# Method: close_session.
# Method: close_session.
    def close_session(self, request, pk=None):
        session = self.get_object()
        if session.etat == "FERMEE":
            return Response({"detail": "Session déjà fermée."}, status=status.HTTP_400_BAD_REQUEST)
        session.etat = "FERMEE"
        session.save(update_fields=["etat"])
        return Response(SessionSerializer(session).data, status=status.HTTP_200_OK)
