
from django.contrib import admin
from .models import Zone, pays, Grade, typeSejour, Session, Laboratoire

# --------------------
# Zone
# --------------------

# Django admin interface configuration for this app.

@admin.register(Zone)
# Model or class: ZoneAdmin.
# ZoneAdmin: Model class for database operations.
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

# --------------------
# Pays
# --------------------
@admin.register(pays)
# Model or class: PaysAdmin.
# PaysAdmin: Model class for database operations.
class PaysAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'zone')
    list_filter = ('zone',)
    search_fields = ('name',)

# --------------------
# Grade
# --------------------
@admin.register(Grade)
# Model or class: GradeAdmin.
# GradeAdmin: Model class for database operations.
class GradeAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom') # jai supprimer qlq chose
    
    search_fields = ['nom']

# --------------------
# typeSejour
# --------------------
@admin.register(typeSejour)
# Model or class: TypeSejourAdmin.
# TypeSejourAdmin: Model class for database operations.
class TypeSejourAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'duree_min_jours', 'duree_max_jours')
    search_fields = ('code',)

# --------------------
# Session
# --------------------
@admin.register(Session)
# Model or class: SessionAdmin.
# SessionAdmin: Model class for database operations.
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'annee_academique', 'date_ouverture', 'date_fermeture', 'etat', 'grille_evaluation')
    list_filter = ('etat', 'annee_academique')
    search_fields = ('annee_academique',)
    raw_id_fields = ('grille_evaluation',)  # pratique si beaucoup de grilles

# --------------------
# Laboratoire
# --------------------
@admin.register(Laboratoire)
# Model or class: LaboratoireAdmin.
# LaboratoireAdmin: Model class for database operations.
class LaboratoireAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'directeur', 'actif')
    list_filter = ('actif',)
    search_fields = ('code', 'name', 'directeur')
