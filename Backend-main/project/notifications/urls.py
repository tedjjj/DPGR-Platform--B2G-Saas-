
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet


# URL routing configuration for this Django app.

router = DefaultRouter()
router.register(r'', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('', include(router.urls)),
]
