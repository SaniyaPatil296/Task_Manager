from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Task
from .serializers import TaskSerializer
from .permissions import IsOwnerPermission


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for complete Task CRUD operations.
    
    Provides:
    - GET /api/tasks/          -> List all tasks for current user (with filtering & search)
    - POST /api/tasks/         -> Create a new task
    - GET /api/tasks/{id}/     -> Retrieve a specific task
    - PUT /api/tasks/{id}/     -> Full update of a task
    - PATCH /api/tasks/{id}/   -> Partial update of a task
    - DELETE /api/tasks/{id}/  -> Delete a task
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwnerPermission]

    def get_queryset(self):
        """
        Ensure users only query their own tasks.
        Provides filtering by status, priority, search text, and ordering.
        """
        # If user is not authenticated, return empty queryset (handled by permission_classes)
        if not self.request.user.is_authenticated:
            return Task.objects.none()

        queryset = Task.objects.filter(owner=self.request.user)

        # Optional query param filters
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        priority_param = self.request.query_params.get('priority')
        if priority_param:
            queryset = queryset.filter(priority=priority_param.upper())

        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(description__icontains=search_query)
            )

        ordering = self.request.query_params.get('ordering')
        if ordering:
            allowed_order_fields = [
                'created_at', '-created_at',
                'due_date', '-due_date',
                'priority', '-priority',
                'title', '-title',
            ]
            if ordering in allowed_order_fields:
                queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        """
        Automatically bind the authenticated user as the owner of the created task.
        """
        serializer.save(owner=self.request.user)
