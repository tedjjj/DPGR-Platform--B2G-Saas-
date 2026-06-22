
from django.urls import path
from . import views


# URL routing configuration for this Django app.

urlpatterns = [
    path('sessions/<int:session_id>/grille-eval/', views.SessionGrilleView.as_view()),
    path('sessions/<int:session_id>/criteres/', views.SessionCritereView.as_view()),
    path('sessions/<int:session_id>/criteres/<int:critere_id>/', views.SessionCritereDetailView.as_view()),
]
