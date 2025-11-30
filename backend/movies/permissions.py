from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow users to edit their own profile
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the profile
        return obj.username == request.user.username


class IsAuthenticated(permissions.BasePermission):
    """
    Allow access only to authenticated users
    """
    def has_permission(self, request, view):
        return bool(request.user and hasattr(request, 'user'))