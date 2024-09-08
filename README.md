# Admin Panel API

This Admin Panel API is built using Node.js, Express, and PostgreSQL to manage users, roles, projects, and audit logs with role-based access control. The API allows the Admin to create and manage users, assign roles, and manage projects. It also provides multi-level authentication and authorization using JWT tokens.

### Deployment Link: https://admin-panel-api-elci.onrender.com

### Postman Collection: https://documenter.getpostman.com/view/33969186/2sAXjRWVXm

## Features

- **User Authentication:** Signin and Signout functionality with JWT token-based authentication.
- **Role-Based Access Control:** Admin, Manager, and Employee roles with different access levels.
- **User Management:** Admins can create, update, and soft-delete users, and assign or revoke roles.
- **Project Management:** Admins can create, update, and delete projects. Managers can assign employees to their assigned projects.
- **Audit Logs:** Tracks user actions, such as creating, updating, and deleting resources, with access only for Admins.
- **Soft Delete & Restore:** Supports soft deletion of users and projects, with options for restoration.
- **Validation Middleware:** Input validation using Joi (optional) for all routes to ensure data integrity.

## Technologies Used

- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web framework for Node.js
- **JWT (jsonwebtoken)** - Authentication and access control
- **PostgreSQL** - SQL database
- **Sequelize ORM** - ORM to interact with the database
- **Joi** - Input validation


## API Endpoints

### Auth Routes
| Method | Endpoint                     | Description                   | Access Level     |
|--------|------------------------------|--------------------------------|------------------|
| POST   | `/api/v1/auth/signup`         | Register a new Admin           | Public           |
| POST   | `/api/v1/auth/signin`         | Login a user                   | Public           |
| POST   | `/api/v1/auth/signout`        | Logout a user                  | Private          |

### User Routes
| Method | Endpoint                     | Description                   | Access Level     |
|--------|------------------------------|--------------------------------|------------------|
| POST   | `/api/v1/auth/register`       | Register a new user            | Admin only       |
| GET    | `/api/v1/users`               | Get all users                  | Admin, Manager   |
| GET    | `/api/v1/users/:userId`       | Get user by ID                 | All users        |
| GET    | `/api/v1/users/current-user`  | Get current user               | All users        |
| PUT    | `/api/v1/users/:userId`       | Update user details            | Admin only       |
| DELETE | `/api/v1/users/:userId`       | Soft delete user               | Admin only       |
| DELETE | `/api/v1/users/permanent/:userId` | Permanent delete user         | Admin only       |
| PATCH  | `/api/v1/users/restore/:userId`   | Restore soft deleted user      | Admin only       |

### Project Routes
| Method | Endpoint                       | Description                   | Access Level     |
|--------|--------------------------------|--------------------------------|------------------|
| POST   | `/api/v1/project`              | Create a new project           | Admin only       |
| GET    | `/api/v1/project`              | Get all projects               | All users        |
| GET    | `/api/v1/project/:projectId`   | Get project by ID              | All users        |
| PUT    | `/api/v1/project/:projectId`   | Update project details         | Admin only       |
| DELETE | `/api/v1/project/:projectId`   | Soft delete project            | Admin only       |
| DELETE | `/api/v1/project/permanent/:projectId` | Permanently delete project | Admin only       |
| PATCH  | `/api/v1/project/restore/:projectId`   | Restore soft deleted project  | Admin only       |

### Audit Logs Routes
| Method | Endpoint                  | Description                   | Access Level     |
|--------|---------------------------|--------------------------------|------------------|
| GET    | `/api/v1/audit-logs`       | Get all audit logs             | Admin only       |

### Roles Routes
| Method | Endpoint                            | Description                   | Access Level     |
|--------|-------------------------------------|--------------------------------|------------------|
| POST   | `/api/v1/users/:userId/assign-role` | Assign a role to a user        | Admin only       |
| POST   | `/api/v1/users/:userId/revoke-role` | Revoke a role from a user      | Admin only       |


### Installation
To run the server side of the Admin Panel API locally, follow these steps:

1. Clone the repository: `git clone https://github.com/raushan-kumar7/admin-panel-api.git`
2. Install the dependencies: `npm install`
3. Start the server in development mode: `npm run dev`
4. Alternatively, to start the server in production mode: `npm run start`
5. The server will run at: `http://localhost:4600/`