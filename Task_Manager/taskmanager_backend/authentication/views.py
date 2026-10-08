from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

from .serializers import (
    UserRegisterSerializer,
    UserLoginSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    Endpoint for registering a new user.
    Method: POST
    Public access.
    Returns: Created user information along with an auth token.
    """
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "message": "User registered successfully.",
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Endpoint for user authentication.
    Method: POST
    Public access.
    Returns: Auth token and user details upon successful login.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "message": "Login successful.",
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    Endpoint for logging out.
    Method: POST
    Protected: Requires valid auth token.
    Action: Deletes the active auth token so it cannot be reused.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Delete user's active token to invalidate the session
        try:
            request.user.auth_token.delete()
        except (AttributeError, Token.DoesNotExist):
            pass

        return Response(
            {"message": "Logged out successfully. Auth token has been invalidated."},
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveAPIView):
    """
    Endpoint for retrieving the current authenticated user's profile.
    Method: GET
    Protected: Requires valid auth token.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
