from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.authtoken.models import Token
from .models import Task


class TaskAPITests(APITestCase):
    """
    Comprehensive test suite for the Task CRUD REST API.
    Verifies authentication requirements, status codes, input validation, and user isolation.
    """

    def setUp(self):
        # Create primary test user
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='Password123!'
        )
        self.token1 = Token.objects.create(user=self.user1)

        # Create secondary test user for isolation checks
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='Password123!'
        )
        self.token2 = Token.objects.create(user=self.user2)

        # Create initial task for user1
        self.task1 = Task.objects.create(
            title='Initial User 1 Task',
            description='Detailed description of task',
            status=Task.StatusChoices.TODO,
            priority=Task.PriorityChoices.MEDIUM,
            owner=self.user1,
        )

        self.list_create_url = reverse('task-list')
        self.detail_url = reverse('task-detail', kwargs={'pk': self.task1.id})

    # ==================== Authentication & Authorization ====================

    def test_unauthenticated_requests_return_401(self):
        """Ensure unauthenticated requests to CRUD endpoints return HTTP 401."""
        # Test List
        res_list = self.client.get(self.list_create_url)
        self.assertEqual(res_list.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test Create
        res_create = self.client.post(self.list_create_url, {'title': 'New Task'})
        self.assertEqual(res_create.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test Retrieve
        res_get = self.client.get(self.detail_url)
        self.assertEqual(res_get.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test Update
        res_put = self.client.put(self.detail_url, {'title': 'Updated'})
        self.assertEqual(res_put.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test Delete
        res_del = self.client.delete(self.detail_url)
        self.assertEqual(res_del.status_code, status.HTTP_401_UNAUTHORIZED)

    # ==================== CRUD Operations ====================

    def test_create_task_success(self):
        """Ensure an authenticated user can create a new task (HTTP 201)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            'title': 'Complete Django API Project',
            'description': 'Implement authentication and CRUD with unit tests',
            'status': 'IN_PROGRESS',
            'priority': 'HIGH',
            'due_date': '2026-10-01',
        }
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], payload['title'])
        self.assertEqual(response.data['status'], 'IN_PROGRESS')
        self.assertEqual(response.data['priority'], 'HIGH')
        self.assertEqual(response.data['owner'], 'user1')

        # Verify persisted in database
        self.assertTrue(Task.objects.filter(id=response.data['id'], owner=self.user1).exists())

    def test_list_tasks(self):
        """Ensure listing tasks returns HTTP 200 and only tasks belonging to current user."""
        # Create a task for user2
        Task.objects.create(
            title='User 2 Secret Task',
            owner=self.user2,
            status=Task.StatusChoices.DONE,
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Handle pagination response format
        results = response.data['results'] if 'results' in response.data else response.data
        task_titles = [t['title'] for t in results]

        self.assertIn('Initial User 1 Task', task_titles)
        self.assertNotIn('User 2 Secret Task', task_titles)

    def test_retrieve_task_detail(self):
        """Ensure retrieving an existing task returns HTTP 200."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.task1.id)
        self.assertEqual(response.data['title'], self.task1.title)

    def test_update_task_put(self):
        """Ensure full update via PUT returns HTTP 200."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {
            'title': 'Completely Updated Title',
            'description': 'Updated description',
            'status': 'DONE',
            'priority': 'LOW',
        }
        response = self.client.put(self.detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Completely Updated Title')
        self.assertEqual(response.data['status'], 'DONE')

    def test_partial_update_task_patch(self):
        """Ensure partial update via PATCH modifies only specified fields (HTTP 200)."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {'status': 'DONE'}
        response = self.client.patch(self.detail_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'DONE')
        # Title should remain unchanged
        self.assertEqual(response.data['title'], self.task1.title)

    def test_delete_task(self):
        """Ensure deleting a task returns HTTP 204 and removes it."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Subsequent retrieve must return 404
        get_response = self.client.get(self.detail_url)
        self.assertEqual(get_response.status_code, status.HTTP_404_NOT_FOUND)

    # ==================== Input Validation (HTTP 400) ====================

    def test_create_task_empty_title(self):
        """Ensure creating a task with empty/whitespace title returns HTTP 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.post(self.list_create_url, {'title': '   '}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_create_task_short_title(self):
        """Ensure title under 3 characters returns HTTP 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.post(self.list_create_url, {'title': 'ab'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data)

    def test_create_task_invalid_status(self):
        """Ensure invalid status choice returns HTTP 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {'title': 'Valid Title', 'status': 'NOT_A_VALID_STATUS'}
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('status', response.data)

    def test_create_task_invalid_priority(self):
        """Ensure invalid priority choice returns HTTP 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        payload = {'title': 'Valid Title', 'priority': 'SUPER_URGENT'}
        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('priority', response.data)

    # ==================== User Isolation & Protection ====================

    def test_user_cannot_access_other_users_task(self):
        """Ensure User 2 receives 404 when attempting to access User 1's task."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_other_users_task(self):
        """Ensure User 2 receives 404 when attempting to update User 1's task."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        response = self.client.patch(self.detail_url, {'title': 'Hacked Title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Verify task was NOT modified
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, 'Initial User 1 Task')

    def test_user_cannot_delete_other_users_task(self):
        """Ensure User 2 receives 404 when attempting to delete User 1's task."""
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token2.key}')
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Verify task still exists in DB
        self.assertTrue(Task.objects.filter(id=self.task1.id).exists())

    # ==================== Filtering & Searching ====================

    def test_filter_tasks_by_status(self):
        """Ensure filtering by status works as expected."""
        Task.objects.create(
            title='In Progress Task',
            status=Task.StatusChoices.IN_PROGRESS,
            owner=self.user1
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(f'{self.list_create_url}?status=IN_PROGRESS')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['status'], 'IN_PROGRESS')

    def test_search_tasks(self):
        """Ensure search query parameter filters matching tasks."""
        Task.objects.create(
            title='UniqueKeyword Task',
            description='Some special notes',
            owner=self.user1
        )
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token1.key}')
        response = self.client.get(f'{self.list_create_url}?search=UniqueKeyword')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results'] if 'results' in response.data else response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['title'], 'UniqueKeyword Task')
