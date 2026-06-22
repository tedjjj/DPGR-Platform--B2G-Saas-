
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet


# URL routing configuration for this Django app.

router = DefaultRouter()
router.register(r'', MessageViewSet, basename='messagerie')

urlpatterns = [
    path('', include(router.urls)),
]
