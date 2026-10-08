from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token


class AuthenticationTests(APITestCase):
    """Test suite for authentication endpoints: registration, login, logout, profile."""

    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.logout_url = reverse('auth_logout')
        self.profile_url = reverse('auth_profile')

        self.valid_user_data = {
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }

    def test_user_registration_success(self):
        """Ensure a new user can register and receive an auth token."""
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'alice')
        self.assertEqual(response.data['user']['email'], 'alice@example.com')

        # Verify password is not plain text in DB
        user = User.objects.get(username='alice')
        self.assertTrue(user.check_password('SecurePassword123!'))
        self.assertNotEqual(user.password, 'SecurePassword123!')

    def test_user_registration_mismatched_passwords(self):
        """Ensure registration fails when password and confirmation do not match."""
        data = self.valid_user_data.copy()
        data['password_confirm'] = 'DifferentPassword123!'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data)

    def test_user_registration_duplicate_username(self):
        """Ensure registration rejects duplicate username."""
        self.client.post(self.register_url, self.valid_user_data, format='json')
        # Try registering again with the same username
        response = self.client.post(self.register_url, self.valid_user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_user_registration_duplicate_email(self):
        """Ensure registration rejects duplicate email."""
        self.client.post(self.register_url, self.valid_user_data, format='json')
        data = self.valid_user_data.copy()
        data['username'] = 'bob'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_user_registration_empty_fields(self):
        """Ensure registration rejects empty inputs."""
        response = self.client.post(self.register_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
        self.assertIn('password', response.data)

    def test_user_login_success(self):
        """Ensure a registered user can log in and obtain a token."""
        user = User.objects.create_user(
            username='charlie',
            email='charlie@example.com',
            password='MyPassword123!'
        )
        login_data = {
            'username': 'charlie',
            'password': 'MyPassword123!'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertEqual(response.data['user']['username'], 'charlie')

    def test_user_login_invalid_credentials(self):
        """Ensure login fails with wrong password."""
        User.objects.create_user(
            username='dave',
            email='dave@example.com',
            password='CorrectPassword123!'
        )
        login_data = {
            'username': 'dave',
            'password': 'WrongPassword999!'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('token', response.data)

    def test_user_profile_authenticated(self):
        """Ensure profile can be retrieved with valid token."""
        user = User.objects.create_user(
            username='eve',
            email='eve@example.com',
            password='Password123!'
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'eve')
        self.assertEqual(response.data['email'], 'eve@example.com')

    def test_user_profile_unauthenticated(self):
        """Ensure profile access is denied (401) without authentication."""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_logout_invalidates_token(self):
        """Ensure logout deletes the active auth token."""
        user = User.objects.create_user(
            username='frank',
            email='frank@example.com',
            password='Password123!'
        )
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

        # Call logout
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempting to access profile with the invalidated token must fail with 401
        profile_response = self.client.get(self.profile_url)
        self.assertEqual(profile_response.status_code, status.HTTP_401_UNAUTHORIZED)
