from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API overview endpoint listing all available routes."""
    return Response({
        "name": "Django REST API - Task Management & Auth",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "authentication": {
                "register": "/api/auth/register/ [POST]",
                "login": "/api/auth/login/ [POST]",
                "logout": "/api/auth/logout/ [POST]",
                "profile": "/api/auth/profile/ [GET]",
            },
            "tasks": {
                "list": "/api/tasks/ [GET]",
                "create": "/api/tasks/ [POST]",
                "detail": "/api/tasks/<id>/ [GET]",
                "update": "/api/tasks/<id>/ [PUT]",
                "partial_update": "/api/tasks/<id>/ [PATCH]",
                "delete": "/api/tasks/<id>/ [DELETE]",
            }
        },
        "docs": "See README.md or postman_collection.json for full documentation and sample payloads."
    })


urlpatterns = [
    path('', api_root, name='home'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('authentication.urls')),
    path('api/tasks/', include('tasks.urls')),
]
