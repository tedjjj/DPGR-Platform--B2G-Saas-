
from django.contrib import admin
from users.views import LogoutView, ChangePasswordView, MonProfilViewSet
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from .views import ask_question


# URL routing configuration for this Django app.

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/users/', include('users.urls')),
    path("api/parametres/", include("parametres.urls")),
    path('api/demandes/', include('demandes.urls')),
    path('api/monprofil/', MonProfilViewSet.as_view({'get': 'list', 'patch': 'partial_update'}), name='monprofil'),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/logs/', include('logs.urls')),
    path('api/ask/', ask_question, name='ask_question'),
    path('api/notifications/', include('notifications.urls')),
    path('api/messagerie/', include('messagerie.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
