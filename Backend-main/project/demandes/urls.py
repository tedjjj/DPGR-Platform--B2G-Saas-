
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers as nested_routers
from .views import DemandeViewSet, liste_rapports
from .documents import DocumentViewSet
from .rapport import RapportViewSet
from evaluations.views import ReponsesCriteresView, ScoreCriteresView


# URL routing configuration for this Django app.

router = DefaultRouter()
router.register(r'', DemandeViewSet, basename='demandes')

demandes_router = nested_routers.NestedDefaultRouter(router, r'', lookup='demande')
demandes_router.register(r'documents', DocumentViewSet, basename='demande-documents')
demandes_router.register(r'rapport', RapportViewSet, basename='demande-rapport')

urlpatterns = [
    path('rapports/', liste_rapports, name='liste-rapports'),  # ← en premier
    path('', include(router.urls)),
    path('', include(demandes_router.urls)),
    path('<int:demande_id>/reponses-criteres/', ReponsesCriteresView.as_view(), name='reponses-criteres'),
    path('<int:demande_id>/score-criteres/', ScoreCriteresView.as_view(), name='score-criteres'),
]
