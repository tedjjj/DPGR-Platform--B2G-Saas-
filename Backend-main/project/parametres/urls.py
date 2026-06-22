
from django.urls import path
from rest_framework.routers import DefaultRouter 
from .views import (

# URL routing configuration for this Django app.

    ZoneGeographiqueViewSet, PaysViewSet,
    GradeViewSet, TypeSejourViewSet,
    SessionViewSet, LaboratoireViewSet,
    
)
from evaluations.views import SessionGrilleView, SessionCritereView, SessionCritereDetailView  # ← AJOUTE SessionGrilleView


router = DefaultRouter()
router.register(r"zones", ZoneGeographiqueViewSet, basename="zones")
router.register(r"pays", PaysViewSet, basename="pays")
router.register(r"grades", GradeViewSet, basename="grades")
router.register(r"type-sejours", TypeSejourViewSet, basename="type-sejours")
router.register(r"sessions", SessionViewSet, basename="sessions")
router.register(r"laboratoires", LaboratoireViewSet, basename="laboratoires")


urlpatterns = [
    path('sessions/<int:session_id>/grille-eval/', SessionGrilleView.as_view()),  # ← AJOUTE CETTE LIGNE
    path('sessions/<int:session_id>/criteres/', SessionCritereView.as_view()),
    path('sessions/<int:session_id>/criteres/<int:critere_id>/', SessionCritereDetailView.as_view()),
]


urlpatterns += router.urls
