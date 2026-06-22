
from rest_framework.permissions import  BasePermission, SAFE_METHODS

# Model or class: isAUTHandREADONLYorSADMIN.

# Custom permission classes and access control logic.

# isAUTHandREADONLYorSADMIN: Class definition.
class isAUTHandREADONLYorSADMIN(BasePermission):
    """
    - GET/HEAD/OPTIONS : accessible à tous les utilisateurs authentifiés
    - POST/PUT/PATCH/DELETE : accessible uniquement aux super administrateurs
     (is_superuser=True)
     """
# Method: has_permission.
# Method: has_permission.
    def has_permission(self,request,view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return user.is_superuser

# Model or class: isSuperAdminOrAssistant.
# isSuperAdminOrAssistant: Class definition.
class isSuperAdminOrAssistant(BasePermission):
    """GET : tous les authentifiés | écriture : Super Admin + Assistant DPGR"""
# Method: has_permission.
# Method: has_permission.
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in ['SUPER_ADMIN', 'ASSISTANT_DPGR']




# Model or class: IsSuperAdmin.
# IsSuperAdmin: Class definition.
class IsSuperAdmin(BasePermission):
# Method: has_permission.
# Method: has_permission.
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'

# Model or class: IsAdminDPGR.
# IsAdminDPGR: Class definition.
class IsAdminDPGR(BasePermission):
# Method: has_permission.
# Method: has_permission.
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN_DPGR'

# Model or class: IsAssistantDPGR.
# IsAssistantDPGR: Class definition.
class IsAssistantDPGR(BasePermission):
# Method: has_permission.
# Method: has_permission.
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ASSISTANT_DPGR'

# Model or class: IsChercheur.
# IsChercheur: Class definition.
class IsChercheur(BasePermission):
# Method: has_permission.
# Method: has_permission.
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CHERCHEUR'
  
