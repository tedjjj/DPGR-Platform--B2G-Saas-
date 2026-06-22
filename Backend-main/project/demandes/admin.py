
from django.contrib import admin

# Register your models here.
# on ajoute tous ce qui manque
from .models import Demande, Document, Decision, Rapport, Log, CoutDemande, StatutDemande, FichierRapport


# Django admin interface configuration for this app.

admin.site.register(Demande)
admin.site.register(Document)
admin.site.register(Decision)
admin.site.register(Rapport)
admin.site.register(Log)
admin.site.register(CoutDemande)
admin.site.register(FichierRapport)
