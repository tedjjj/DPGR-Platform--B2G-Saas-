
from rest_framework.permissions import BasePermission

# Model or class: IsSuperAdmin.

# Utility functions and helper code.

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
