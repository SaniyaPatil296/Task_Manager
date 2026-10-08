# 🎯 Task Management REST API with Django REST Framework

A secure, production-ready CRUD REST API built with **Python 3.9+**, **Django 4.2**, and **Django REST Framework (DRF)**, featuring token-based authentication, user data isolation, input validation, automated test coverage, and Postman collection support.

---

## 📋 Features & Requirements Matrix

| Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Core Resource CRUD** | Full CRUD for Tasks at `/api/tasks/` (List, Create, Retrieve, Update, Partial Update, Delete) |
| **User Registration & Login** | Public endpoints `/api/auth/register/` and `/api/auth/login/`  |
| **Password Hashing** | Passwords hashed using Django's built-in PBKDF2 SHA-256 hasher (never plain text) |
| **Protected Routes** | DRF Token Authentication (`Authorization: Token <key>`). Returns `401 Unauthorized` without token | 
| **Proper HTTP Status Codes** | `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` | 
| **Input Validation** | Validates non-empty title (min 3 chars), valid status choices, valid priority choices, email uniqueness, password confirmation | 
| **Resource Ownership Isolation** | Users can only see and manipulate their own tasks. Cross-user access returns `404 Not Found` |
| **Automated Tests** | 26 unit & integration tests covering auth, CRUD, validation, permissions, and filters |
| **Postman Collection** | Pre-configured `postman_collection.json` with dynamic auth token capture | 

---

## 🛠 Tech Stack

- **Framework**: Django 4.2 LTS
- **REST Toolkit**: Django REST Framework 3.16
- **Authentication**: DRF Token Authentication (`rest_framework.authtoken`)
- **Database**: SQLite 3 (configured for dev; easily switched to PostgreSQL/MySQL)
- **Language**: Python 3.9+

---


###  Set Up Virtual Environment
```bash
# Windows
python -m venv .venv
.venv\Scripts\activate.ps1

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Apply Database Migrations
```bash
python manage.py migrate
```

###  Run the Server
```bash
python manage.py runserver
```
The server will start at `http://127.0.0.1:8000/`. You can view the API overview by visiting `http://127.0.0.1:8000/api/` in your browser.

---

## 🧪 Running Automated Tests

Run the complete test suite:
```bash
python manage.py test
```


---


## 📖 API Documentation & Endpoints

### Base URL: `http://127.0.0.1:8000`

### Authentication Header:
For all protected endpoints, provide the token in the `Authorization` header:
```http
Authorization: Token <your_auth_token>
```

---

### 1. System Overview

#### `GET /api/`
- **Description**: Returns API metadata and a quick directory of endpoints.
- **Authentication**: None (Public)
- **Response**: `200 OK`
```json
{
  "name": "Django REST API - Task Management & Auth",
  "version": "1.0.0",
  "status": "online",
  "endpoints": {
    "authentication": {
      "register": "/api/auth/register/ [POST]",
      "login": "/api/auth/login/ [POST]",
      "logout": "/api/auth/logout/ [POST]",
      "profile": "/api/auth/profile/ [GET]"
    },
    "tasks": {
      "list": "/api/tasks/ [GET]",
      "create": "/api/tasks/ [POST]",
      "detail": "/api/tasks/<id>/ [GET]",
      "update": "/api/tasks/<id>/ [PUT]",
      "partial_update": "/api/tasks/<id>/ [PATCH]",
      "delete": "/api/tasks/<id>/ [DELETE]"
    }
  }
}
```

---

### 2. Authentication Endpoints

#### `POST /api/auth/register/`
- **Description**: Registers a new user account, securely hashes the password, and returns an auth token.
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}
```
- **Response**: `201 Created`
```json
{
  "message": "User registered successfully.",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "first_name": "",
    "last_name": "",
    "date_joined": "2026-09-17T15:45:00Z"
  }
}
```
- **Error Response**: `400 Bad Request` (mismatched password, duplicate username/email, empty inputs)
```json
{
  "password_confirm": ["Passwords do not match."]
}
```

#### `POST /api/auth/login/`
- **Description**: Authenticates user credentials and returns the active auth token.
- **Authentication**: None (Public)
- **Request Body**:
```json
{
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```
- **Response**: `200 OK`
```json
{
  "message": "Login successful.",
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "first_name": "",
    "last_name": "",
    "date_joined": "2026-09-17T15:45:00Z"
  }
}
```
- **Error Response**: `400 Bad Request` (invalid credentials)
```json
{
  "non_field_errors": ["Invalid credentials. Please check your username and password."]
}
```

#### `GET /api/auth/profile/`
- **Description**: Retrieves the profile details of the authenticated user.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Response**: `200 OK`
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "johndoe@example.com",
  "first_name": "",
  "last_name": "",
  "date_joined": "2026-09-17T15:45:00Z"
}
```
- **Error Response**: `401 Unauthorized`
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### `POST /api/auth/logout/`
- **Description**: Revokes and deletes the user's active auth token from the database.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Response**: `200 OK`
```json
{
  "message": "Logged out successfully. Auth token has been invalidated."
}
```

---

### 3. Task Management CRUD Endpoints (`/api/tasks/`)

#### `GET /api/tasks/`
- **Description**: Returns paginated list of tasks belonging to the authenticated user. Supports filtering and search.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Query Parameters**:
  - `status`: Filter by status (`TODO`, `IN_PROGRESS`, `DONE`)
  - `priority`: Filter by priority (`LOW`, `MEDIUM`, `HIGH`)
  - `search`: Search across `title` and `description`
  - `ordering`: Sort by field (e.g. `due_date`, `-created_at`)
  - `page`: Page number (pagination: 10 items per page)
- **Response**: `200 OK`
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Build Django REST API",
      "description": "Full CRUD with authentication and automated tests",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "due_date": "2026-10-31",
      "owner": "johndoe",
      "created_at": "2026-09-17T15:50:00Z",
      "updated_at": "2026-09-17T15:52:00Z"
    }
  ]
}
```

#### `POST /api/tasks/`
- **Description**: Creates a new task. The `owner` is automatically set to the authenticated user.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Request Body**:
```json
{
  "title": "Design Database Schema",
  "description": "Normalize tables and add foreign keys",
  "status": "TODO",
  "priority": "MEDIUM",
  "due_date": "2026-10-15"
}
```
- **Response**: `201 Created`
```json
{
  "id": 2,
  "title": "Design Database Schema",
  "description": "Normalize tables and add foreign keys",
  "status": "TODO",
  "priority": "MEDIUM",
  "due_date": "2026-10-15",
  "owner": "johndoe",
  "created_at": "2026-09-17T15:53:10Z",
  "updated_at": "2026-09-17T15:53:10Z"
}
```
- **Error Response**: `400 Bad Request` (e.g. blank title or invalid status)
```json
{
  "title": ["Title cannot be blank or contain only whitespace."],
  "status": ["Invalid status 'PENDING'. Allowed choices: TODO, IN_PROGRESS, DONE."]
}
```

#### `GET /api/tasks/{id}/`
- **Description**: Retrieves a single task by its ID.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Response**: `200 OK`
```json
{
  "id": 1,
  "title": "Build Django REST API",
  "description": "Full CRUD with authentication and automated tests",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "due_date": "2026-10-31",
  "owner": "johndoe",
  "created_at": "2026-09-17T15:50:00Z",
  "updated_at": "2026-09-17T15:52:00Z"
}
```
- **Error Response**: `404 Not Found` (if task does not exist or belongs to another user)
```json
{
  "detail": "Not found."
}
```

#### `PUT /api/tasks/{id}/`
- **Description**: Full update of all writable fields of a task.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Request Body**:
```json
{
  "title": "Design Database Schema (Final)",
  "description": "Added indexes on status and priority",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "due_date": "2026-10-20"
}
```
- **Response**: `200 OK`
```json
{
  "id": 2,
  "title": "Design Database Schema (Final)",
  "description": "Added indexes on status and priority",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "due_date": "2026-10-20",
  "owner": "johndoe",
  "created_at": "2026-09-17T15:53:10Z",
  "updated_at": "2026-09-17T15:55:22Z"
}
```

#### `PATCH /api/tasks/{id}/`
- **Description**: Partial update of one or more task fields (e.g. marking as `DONE`).
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Request Body**:
```json
{
  "status": "DONE"
}
```
- **Response**: `200 OK`
```json
{
  "id": 2,
  "title": "Design Database Schema (Final)",
  "description": "Added indexes on status and priority",
  "status": "DONE",
  "priority": "HIGH",
  "due_date": "2026-10-20",
  "owner": "johndoe",
  "created_at": "2026-09-17T15:53:10Z",
  "updated_at": "2026-09-17T15:56:01Z"
}
```

#### `DELETE /api/tasks/{id}/`
- **Description**: Permanently deletes a task.
- **Authentication**: **Required** (`Authorization: Token <token>`)
- **Response**: `204 No Content` (Empty body)
- **Error Response**: `404 Not Found` (if task does not exist or belongs to another user)

---

## 💻 Sample `curl` Commands

### 1. Register a user
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "Password123!",
    "password_confirm": "Password123!"
  }'
```

### 2. Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "Password123!"
  }'
```

### 3. Create a task (Replace `<TOKEN>` with your token)
```bash
curl -X POST http://127.0.0.1:8000/api/tasks/ \
  -H "Authorization: Token <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write unit tests",
    "description": "Ensure 100% test coverage",
    "status": "TODO",
    "priority": "HIGH"
  }'
```

### 4. List tasks with filter
```bash
curl -X GET "http://127.0.0.1:8000/api/tasks/?status=TODO&priority=HIGH" \
  -H "Authorization: Token <TOKEN>"
```

### 5. Partial update (Mark task done)
```bash
curl -X PATCH http://127.0.0.1:8000/api/tasks/1/ \
  -H "Authorization: Token <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```

### 6. Delete task
```bash
curl -X DELETE http://127.0.0.1:8000/api/tasks/1/ \
  -H "Authorization: Token <TOKEN>"
```

## 🔒 Security Best Practices Implemented

1. **Password Hashing**: Django's cryptographic PBKDF2 with SHA-256 algorithm and 600,000 iterations.
2. **Data Isolation**: Strict per-user object-level permissions (`IsOwnerPermission` and query scoping).
3. **Validation Guards**: Custom model & serializer validators preventing invalid states, empty titles, and duplicate credentials.
4. **Token Invalidation**: Server-side token deletion on logout ensuring revoked sessions cannot be reused.
