
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ProfilChercheur

# Model or class: CustomUserAdmin.

# Django admin interface configuration for this app.

# CustomUserAdmin: Class definition.
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'nom', 'prenom', 'role', 'is_active', 'is_staff']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'nom', 'prenom']
    ordering = ['email']
    readonly_fields = ('date_joined', 'derniere_connexion')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informations personnelles', {'fields': ('nom', 'prenom', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('derniere_connexion', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'nom', 'prenom', 'role', 'is_active', 'is_staff', 'is_superuser'),
        }),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(ProfilChercheur)
