
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from .permission import IsSuperAdmin, IsAdminDPGR, IsAssistantDPGR, IsChercheur
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from .models import User, ProfilChercheur
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets, status
from rest_framework.response import Response
from .serializers import ProfilChercheurSerializer
from logs.models import Log



# Model or class: MeView.

# API views and request handlers for this Django app.

# MeView: API view handler for incoming requests.
class MeView(APIView):
    permission_classes = [IsAuthenticated]

# Method: get.
# Method: get.
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# Method: patch.
# Method: patch.
    def patch(self, request):
     telephone = request.data.get("telephone")
     if not telephone:
        return Response({"error": "Numéro de téléphone requis"}, status=status.HTTP_400_BAD_REQUEST)
    
     request.user.telephone = telephone
     request.user.save()
     return Response({"message": "Numéro de téléphone mis à jour", "telephone": request.user.telephone})

# Model or class: UserViewSet.
# UserViewSet: Model class for database operations.
class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsSuperAdmin]

# Method: perform_create.
# Handler for creating new records: perform_create.
    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
# Method: me.
# Method: me.
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    @action(detail=True, methods=['patch'], permission_classes=[IsSuperAdmin])
# Method: toggle_active.
# Method: toggle_active.
    def toggle_active(self, request, pk=None):
     user = self.get_object()
     user.is_active = not user.is_active
     user.save()
     status_msg = "activé" if user.is_active else "désactivé"
     return Response({"message": f"Utilisateur {status_msg} avec succès", "is_active": user.is_active})
# Getter method: get_queryset.
# Getter function: get_queryset.
    def get_queryset(self):
        queryset = User.objects.all()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset
    
    @action(detail=True, methods=['get', 'post', 'patch'], permission_classes=[IsSuperAdmin])
# Method: profil.
# Method: profil.
    def profil(self, request, pk=None):
     user = self.get_object()

    # vérifier que le user est bien un chercheur
     if user.role != 'CHERCHEUR':
        return Response({"error": "Cet utilisateur n'est pas un chercheur"}, status=status.HTTP_400_BAD_REQUEST)

     if request.method == 'GET':
        profil = ProfilChercheur.objects.get(user=user)
        serializer = ProfilChercheurSerializer(profil)
        return Response(serializer.data)
     elif request.method == 'POST':
        serializer = ProfilChercheurSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

     elif request.method == 'PATCH':
        profil = ProfilChercheur.objects.get(user=user)
        serializer = ProfilChercheurSerializer(profil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# Model or class: LogoutView.
# LogoutView: API view handler for incoming requests.
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

# Method: post.
# Method: post.
    def post(self, request):
# Error handling block.
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            Log.objects.create(
                user=request.user,
                action='LOGOUT',
                details=f'Deconnexion de {request.user.email}',
                ip_address=request.META.get('REMOTE_ADDR'),
            )
            return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"error": "Token invalide"}, status=status.HTTP_400_BAD_REQUEST)
        


# Model or class: ChangePasswordView.
# ChangePasswordView: API view handler for incoming requests.
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

# Method: post.
# Method: post.
    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

       
        if not user.check_password(old_password):
            return Response({"error": "Ancien mot de passe incorrect"}, status=status.HTTP_400_BAD_REQUEST)

        # changer le mot de passe
        user.set_password(new_password)
        user.save()

        return Response({"message": "Mot de passe changé avec succès"}, status=status.HTTP_200_OK)



# Model or class: MonProfilViewSet.
# MonProfilViewSet: API view handler for incoming requests.
class MonProfilViewSet(viewsets.ViewSet):
    """
    ViewSet pour permettre à un chercheur connecté
    de consulter et modifier SON propre profil.
    """
    permission_classes = [IsAuthenticated]

# Getter method: get_profil.
# Getter function: get_profil.
    def get_profil(self, request):
# Error handling block.
        try:
            return request.user.profil
        except ProfilChercheur.DoesNotExist:
            return None

# Method: list.
# Handler for retrieving records: list.
    def list(self, request):
        """
        GET /monprofil/
        Récupère le profil du chercheur connecté.
        """
        profil = self.get_profil(request)
        if not profil:
            return Response({"error": "Profil non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProfilChercheurSerializer(profil)
        return Response(serializer.data)

# Method: partial_update.
# Method: partial_update.
    def partial_update(self, request, pk=None):
        """
        PATCH /monprofil/
        Permet au chercheur de modifier son profil.
        """
        profil = self.get_profil(request)
        if not profil:
            return Response({"error": "Profil non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProfilChercheurSerializer(profil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
