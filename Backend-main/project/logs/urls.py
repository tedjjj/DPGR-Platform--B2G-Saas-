
from django.urls import path
from .views import LogViewSet


# URL routing configuration for this Django app.

urlpatterns = [
    path('', LogViewSet.as_view()),
]
