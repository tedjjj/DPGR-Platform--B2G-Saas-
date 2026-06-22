
from django.urls import path
from .views import (

# URL routing configuration for this Django app.

    DashboardChercheurView,
    DashboardAssistantView,
    DashboardAdminView,
    DashboardSuperAdminView,
    LandingStatsView,
)

urlpatterns = [
    path('chercheur/', DashboardChercheurView.as_view()),
    path('assistant/', DashboardAssistantView.as_view()),
    path('admin/', DashboardAdminView.as_view()),
    path('super-admin/', DashboardSuperAdminView.as_view()),
    path('landing/', LandingStatsView.as_view(), name='landing-stats'),
]
