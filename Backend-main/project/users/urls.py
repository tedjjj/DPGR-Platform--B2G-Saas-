
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, MonProfilViewSet , ChangePasswordView
from .views import MeView

# URL routing configuration for this Django app.

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'monprofil', MonProfilViewSet, basename='monprofil')

urlpatterns = [

    path('me/', MeView.as_view(), name='me'), 
    path('', include(router.urls)),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
]
