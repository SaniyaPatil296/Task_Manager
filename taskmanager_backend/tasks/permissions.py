from rest_framework import permissions


class IsOwnerPermission(permissions.BasePermission):
    """
    Custom permission to ensure users can only access and modify their own tasks.
    """

    def has_object_permission(self, request, view, obj):
        # Read and write permissions are only allowed to the owner of the task.
        return obj.owner == request.user
