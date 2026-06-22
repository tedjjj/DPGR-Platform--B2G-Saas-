


from django.contrib import admin
from .models import GrilleEvaluation, CritereEvaluation, EligibiliteEvaluation, ReponseCritere



# Django admin interface configuration for this app.

@admin.register(GrilleEvaluation)
# Model or class: GrilleEvaluationAdmin.
# GrilleEvaluationAdmin: Model class for database operations.
class GrilleEvaluationAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active', 'DateVersion')
    search_fields = ('code', 'name')
    list_filter = ('is_active', 'DateVersion')
    ordering = ('-DateVersion',)


@admin.register(CritereEvaluation)
# Model or class: CritereEvaluationAdmin.
# CritereEvaluationAdmin: Model class for database operations.
class CritereEvaluationAdmin(admin.ModelAdmin):
    list_display = ('name', 'grille', 'weight', 'type_critere', 'is_active')
    search_fields = ('name', 'description')
    list_filter = ('type_critere', 'is_active', 'grille')
    ordering = ('grille', 'name')

# commentaires pour EligibiliteEvaluationAdmin :
@admin.register(EligibiliteEvaluation)
# Model or class: EligibiliteEvaluationAdmin.
# EligibiliteEvaluationAdmin: Model class for database operations.
class EligibiliteEvaluationAdmin(admin.ModelAdmin):
    list_display = (
        'demande',
        'dernier_stage_valide',
        'nb_stages_valide',
        'resultat',
        'date_verification'
    )
    list_filter = ('resultat', 'dernier_stage_valide', 'nb_stages_valide')
    search_fields = ('demande__numero_demande',)
    readonly_fields = ('date_verification',)
@admin.register(ReponseCritere)
# Model or class: ReponseCritereAdmin.
# ReponseCritereAdmin: Model class for database operations.
class ReponseCritereAdmin(admin.ModelAdmin):
    list_display = ('demande', 'critere', 'is_validated', 'date_reponse')
    list_filter = ('is_validated', 'critere')
    search_fields = ('demande__numero_demande', 'critere__name')
