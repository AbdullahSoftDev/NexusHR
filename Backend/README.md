<div align="center">

# 🏢 NexusHR Backend API

### The secure, modular backend powering the NexusHR Human Resource Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express\&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase\&logoColor=white)](https://supabase.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens\&logoColor=white)](https://jwt.io/)
[![Jest](https://img.shields.io/badge/Testing-Jest-C21325?logo=jest\&logoColor=white)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](../LICENSE)

</div>

---

## 📌 Overview

**NexusHR Backend** is the REST API layer of the NexusHR Human Resource Management Platform.

It provides the server-side infrastructure required to manage employees, authentication, attendance, leave requests, payroll, company settings, and HR operations through a centralized API.

The backend is designed around a **modular and maintainable architecture**, separating routes, controllers, models, middleware, configuration, and utilities so that individual HR modules can evolve independently.

The application is built with **Node.js and Express.js** and uses **Supabase PostgreSQL** as its persistent data layer. Security is strengthened through JWT authentication, password hashing, Helmet security headers, CORS configuration, API rate limiting, centralized error handling, and structured logging.

---

## ✨ Core Capabilities

### 🔐 Authentication & Authorization

* User authentication through the backend API
* JWT-based authentication
* Password hashing with bcrypt
* Role-aware HR access
* Support for:

  * `admin`
  * `hr`
  * `employee`
* Active/inactive user management
* Login tracking
* Protected API operations

### 👥 Employee Management

* Employee records
* Employee IDs
* Personal information
* Contact information
* Department assignment
* Job position
* Hiring information
* Salary information
* Employment status
* Emergency contacts
* Banking information
* Employee notes
* Avatar support

### ⏱️ Attendance Management

* Employee attendance records
* Check-in and check-out
* Total working hours
* Attendance status
* Late and half-day tracking
* Leave-aware attendance
* Attendance location
* IP address tracking
* Attendance method tracking
* Daily attendance uniqueness

Supported attendance states include:

* `present`
* `late`
* `half_day`
* `absent`
* `on_leave`

### 🏖️ Leave Management

* Leave applications
* Leave types
* Leave duration
* Leave reasons
* Approval workflow
* Rejection workflow
* Cancellation support
* Review information
* HR/admin review tracking

Supported leave types include:

* Annual
* Sick
* Personal
* Maternity
* Unpaid

### 💰 Payroll Management

* Employee payroll records
* Monthly payroll processing
* Base salary
* Working days
* Present days
* Unpaid leave days
* Overtime hours
* Overtime compensation
* Bonuses
* Deductions
* Tax
* Health insurance
* Net salary
* Payment status
* Payment date
* Payment method

Payroll states include:

* `draft`
* `processed`
* `paid`

### 🏢 Department Management

The database supports organizational departments with:

* Department names
* Department heads
* Employee counts
* Department budgets

### ⚙️ Company Settings

NexusHR supports centralized company configuration including:

* Company name
* Company email
* Phone
* Address
* Registration number
* Tax ID
* Currency
* Time zone
* Working hours
* Working days
* Annual leave quota
* Sick leave quota
* Personal leave quota

### 🔔 Notifications

The backend database supports notifications associated with individual users.

Notification categories include:

* Leave
* Payroll
* Attendance
* Announcement
* System

Notifications can also be marked as read/unread and associated with application links.

### 📢 Announcements

The backend supports company-wide and department-specific announcements with:

* Title
* Content
* Priority
* Author
* Target department
* Creation and update timestamps

### 🧾 Audit Logging

NexusHR includes an audit-log data layer for recording:

* Employee-related actions
* Performing user
* Action type
* Additional details
* Timestamp

This provides an important foundation for accountability and administrative traceability.

---

## 🏗️ Architecture

The backend follows a modular REST API architecture:

```text
                    ┌──────────────────────────┐
                    │      NexusHR Frontend    │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTP / REST
                                 ▼
                    ┌──────────────────────────┐
                    │      Express Server      │
                    │       Node.js API        │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌──────────┐       ┌────────────┐     ┌─────────────┐
        │ Security │       │ Middleware │     │ Rate Limit  │
        │ Helmet   │       │ Auth/Error │     │  Protection │
        └──────────┘       └─────┬──────┘     └─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │          Routes          │
                    ├──────────────────────────┤
                    │ Auth                     │
                    │ Employees                │
                    │ Attendance               │
                    │ Leaves                   │
                    │ Payroll                  │
                    │ Settings                 │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │       Controllers        │
                    │ Business Logic / Request  │
                    │ Handling                  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │          Models          │
                    │ Data Access / Entities   │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │     Supabase Client      │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Supabase PostgreSQL   │
                    └──────────────────────────┘
```

---

## 🔄 Request Lifecycle

A typical request follows this flow:

```text
Client
  │
  ▼
Express
  │
  ├── CORS
  ├── Helmet
  ├── Rate Limiter
  ├── Body Parser
  │
  ▼
Route
  │
  ▼
Authentication / Middleware
  │
  ▼
Controller
  │
  ▼
Model / Supabase
  │
  ▼
PostgreSQL
  │
  ▼
Controller Response
  │
  ▼
JSON Response
```

This structure keeps HTTP routing, business logic, and data access separated.

---

## 🛡️ Security

Security is treated as a core part of the backend rather than an afterthought.

### Helmet

Express security headers are enabled using Helmet.

```javascript
app.use(helmet());
```

### CORS

Cross-origin access is controlled through the configured client URL.

```text
CLIENT_URL
```

The backend also supports credentials for authenticated requests.

### Rate Limiting

API requests under `/api` are protected by `express-rate-limit`.

The current configuration allows:

```text
100 requests / minute
```

per rate-limit window.

### Password Hashing

Passwords are protected using:

```text
bcryptjs
```

Plain-text passwords should never be stored directly in the database.

### JWT Authentication

JSON Web Tokens are used for authenticated API access.

### Environment Variables

Sensitive configuration such as Supabase credentials is loaded from environment variables rather than hard-coded into the application.

### Centralized Error Handling

The backend uses a dedicated error-handling middleware:

```text
src/middleware/errorHandler.js
```

### Database Constraints

The PostgreSQL schema includes:

* Primary keys
* Foreign keys
* Unique constraints
* Check constraints
* Indexes
* Cascading relationships
* Automatic timestamp triggers

---

## 🧰 Tech Stack

| Technology             | Purpose                      |
| ---------------------- | ---------------------------- |
| **Node.js**            | JavaScript runtime           |
| **Express.js**         | REST API framework           |
| **Supabase**           | Backend database platform    |
| **PostgreSQL**         | Relational database          |
| **JWT**                | Authentication               |
| **bcryptjs**           | Password hashing             |
| **Helmet**             | HTTP security headers        |
| **CORS**               | Cross-origin request control |
| **express-rate-limit** | API rate limiting            |
| **dotenv**             | Environment configuration    |
| **Winston**            | Application logging          |
| **UUID**               | Unique identifiers           |
| **node-fetch**         | HTTP requests                |
| **Jest**               | Testing framework            |
| **Supertest**          | HTTP API testing             |
| **Nodemon**            | Development auto-reload      |

The technologies above correspond to the dependencies currently defined in the backend's `package.json`.

---

## 📁 Project Structure

```text
Backend/
│
├── src/
│   │
│   ├── config/
│   │   └── supabase.js
│   │
│   ├── controllers/
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── leaveController.js
│   │   ├── payrollController.js
│   │   └── settingsController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Department.js
│   │   ├── Employee.js
│   │   ├── Leave.js
│   │   ├── Payroll.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── leaveRoutes.js
│   │   ├── payrollRoutes.js
│   │   └── settingsRoutes.js
│   │
│   ├── utils/
│   │
│   ├── migrate.js
│   ├── seed.js
│   └── server.js
│
├── tests/
│
├── package.json
├── package-lock.json
├── supabase-schema.sql
└── README.md
```

The current repository structure contains dedicated configuration, controller, middleware, model, route, utility, migration, seed, and server layers.

---

## 🌐 API Base URL

During local development, the backend runs on:

```text
http://localhost:5000
```

The API base path is:

```text
http://localhost:5000/api
```

The server currently defaults to port `5000` and exposes the API modules under `/api`.

---

## 🔗 API Modules

| Module         | Base Endpoint     | Purpose                      |
| -------------- | ----------------- | ---------------------------- |
| Authentication | `/api/auth`       | Login and authentication     |
| Employees      | `/api/employees`  | Employee management          |
| Attendance     | `/api/attendance` | Attendance operations        |
| Leaves         | `/api/leaves`     | Leave management             |
| Payroll        | `/api/payroll`    | Payroll operations           |
| Settings       | `/api`            | Company/application settings |
| Health         | `/api/health`     | API health check             |
| Database       | `/api/test-db`    | Database connectivity check  |

These route groups are registered directly by the Express server.

---

## ❤️ Health Check

The backend provides a health endpoint:

```http
GET /api/health
```

Example response:

```json
{
  "success": true,
  "status": "OK",
  "message": "NexusHR API is running",
  "timestamp": "2026-08-19T00:00:00.000Z",
  "environment": "development"
}
```

This endpoint is useful for verifying that the API server is running.

---

## 🗄️ Database

NexusHR uses **Supabase PostgreSQL** as its primary database.

The backend initializes the Supabase client using:

```text
SUPABASE_URL
SUPABASE_SERVICE_KEY
```

or:

```text
SUPABASE_URL
SUPABASE_KEY
```

The backend verifies the database connection during startup.

---

## 🧱 Database Schema

The included `supabase-schema.sql` defines the core NexusHR data model.

### Tables

```text
users
employees
attendance
leaves
payroll
departments
company_settings
notifications
audit_logs
announcements
```

### Relationships

```text
Users
 │
 ├────────────── Employees
 │                    │
 │                    ├── Attendance
 │                    ├── Leaves
 │                    └── Payroll
 │
 ├── Notifications
 │
 └── Audit / Administrative Actions
```

The schema also defines indexes for commonly queried fields and database triggers for automatically maintaining `updated_at` timestamps.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js 18 or newer
* npm
* A Supabase project
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/AbdullahSoftDev/NexusHR.git
```

Navigate to the backend:

```bash
cd NexusHR/Backend
```

---

### 2. Install Dependencies

```bash
npm install
```

The project uses the dependencies defined in `package.json`.

---

### 3. Configure Environment Variables

Create a `.env` file inside the `Backend` directory:

```env
PORT=5000
NODE_ENV=development

CLIENT_URL=http://localhost:3000

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key

JWT_SECRET=your_secure_jwt_secret
```

If using the Supabase service key:

```env
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

> **Important:** Never commit `.env` files or Supabase service-role credentials to GitHub.

---

## 🗃️ 4. Configure Supabase

Open your Supabase project and navigate to the SQL Editor.

Copy the contents of:

```text
Backend/supabase-schema.sql
```

and execute the SQL script.

The schema creates the application's core tables, relationships, indexes, triggers, and initial company/departments data.

---

## 🔄 5. Run Database Migration

The backend includes a migration script:

```bash
npm run migrate
```

The migration entry point is:

```text
src/migrate.js
```

---

## 🌱 6. Seed Development Data

The project also contains:

```text
src/seed.js
```

Use the project's seed workflow when initializing development data.

---

## ▶️ 7. Start Development Server

```bash
npm run dev
```

Nodemon will automatically restart the server when source files change.

---

## 🚀 Production Start

To start the backend without Nodemon:

```bash
npm start
```

This runs:

```text
node src/server.js
```

The available npm scripts include development, production start, migration, Jest tests, and watch-mode testing.

---

## 🧪 Testing

NexusHR Backend uses:

* Jest
* Supertest

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The Jest configuration is included in `package.json` and is configured for the Node.js environment.

---

## 🔍 Database Connection Test

After starting the backend, verify the Supabase connection using:

```http
GET /api/test-db
```

A successful response confirms that the backend can communicate with the database.

If the schema has not been applied, the endpoint returns an error indicating that the Supabase schema needs to be executed.

---

## ⚙️ Environment Variables

| Variable               | Required | Description                        |
| ---------------------- | -------: | ---------------------------------- |
| `PORT`                 |       No | API server port                    |
| `NODE_ENV`             |       No | Application environment            |
| `CLIENT_URL`           |      Yes | Frontend origin allowed by CORS    |
| `SUPABASE_URL`         |      Yes | Supabase project URL               |
| `SUPABASE_KEY`         |     Yes* | Supabase API key                   |
| `SUPABASE_SERVICE_KEY` |      No* | Supabase service-role key          |
| `JWT_SECRET`           |      Yes | Secret used for JWT authentication |

* The backend accepts either `SUPABASE_SERVICE_KEY` or `SUPABASE_KEY`.

---

## 🔐 Recommended Production Configuration

Before deploying to production:

* Use a strong, randomly generated JWT secret.
* Never expose the Supabase service-role key to the frontend.
* Set an explicit production `CLIENT_URL`.
* Use HTTPS.
* Configure production CORS carefully.
* Keep `.env` outside source control.
* Rotate credentials if they are accidentally exposed.
* Use a production-grade logging strategy.
* Review rate-limit settings based on expected traffic.
* Keep Node.js and dependencies updated.
* Restrict database permissions wherever possible.
* Back up production database data.

---

## 🧩 Middleware Stack

The Express application currently uses several layers of middleware:

```text
Incoming Request
       │
       ▼
     Helmet
       │
       ▼
      CORS
       │
       ▼
   Rate Limiter
       │
       ▼
   Body Parser
       │
       ▼
 Request Logger
       │
       ▼
 Authentication
       │
       ▼
     Routes
       │
       ▼
  Controllers
       │
       ▼
 Error Handler
```

The server currently applies Helmet, CORS, API rate limiting, JSON/urlencoded body parsing, request logging, a 404 handler, and centralized error handling.

---

## 📊 Data Model

### User

Represents an authenticated NexusHR account.

```text
User
├── username
├── email
├── password_hash
├── role
├── name
├── position
├── department
├── employee_id
├── phone
└── is_active
```

### Employee

Represents an employee within the organization.

```text
Employee
├── employee_id
├── first_name
├── last_name
├── email
├── phone
├── position
├── department
├── hire_date
├── salary
├── status
├── emergency_contact
├── bank_account
└── user_id
```

### Attendance

```text
Attendance
├── employee_id
├── date
├── check_in_time
├── check_out_time
├── total_hours
├── status
├── location
├── ip_address
└── method
```

### Leave

```text
Leave
├── employee_id
├── leave_type
├── start_date
├── end_date
├── total_days
├── reason
├── status
├── reviewed_by
└── review_notes
```

### Payroll

```text
Payroll
├── employee_id
├── month
├── base_salary
├── working_days
├── present_days
├── unpaid_leave_days
├── overtime_hours
├── overtime_pay
├── bonuses
├── deductions
├── tax
├── health_insurance
├── net_salary
└── payment_status
```

---

## 🛠️ Development Philosophy

The backend is structured around several principles:

### Separation of Concerns

Routes, controllers, models, middleware, configuration, and utilities have separate responsibilities.

### Modular Design

Each HR domain has its own route/controller structure.

```text
Authentication
Employees
Attendance
Leaves
Payroll
Settings
```

### Security by Default

Security middleware and authentication infrastructure are integrated into the API rather than treated as optional additions.

### Database Integrity

The PostgreSQL schema uses relationships, constraints, indexes, and triggers to preserve data consistency.

### Maintainability

The project structure makes it possible to extend individual modules without turning the entire backend into a single large codebase.

---

## 🧭 Future Extension Areas

The architecture can be extended with additional enterprise HR capabilities such as:

* Advanced role-based permissions
* Refresh-token rotation
* Two-factor authentication
* Email notifications
* Real-time notifications
* Document management
* Employee performance reviews
* Recruitment management
* Expense management
* Timesheets
* Advanced payroll calculations
* Reporting and analytics
* Exportable HR reports
* API documentation with OpenAPI/Swagger
* Automated CI/CD
* Production monitoring
* Background job processing

---

## 🔗 Related Project

NexusHR is organized as a larger HR management platform, with this repository containing the backend API.

**Main Repository**

[AbdullahSoftDev/NexusHR](https://github.com/AbdullahSoftDev/NexusHR)

**Backend**

[AbdullahSoftDev/NexusHR/Backend](https://github.com/AbdullahSoftDev/NexusHR/tree/main/Backend)

---

## 📚 Backend Resources

* `src/server.js` — Express application and API initialization
* `src/config/supabase.js` — Supabase client and connection testing
* `src/controllers/` — Request/business logic
* `src/routes/` — API route definitions
* `src/models/` — Data models/data-access layer
* `src/middleware/` — Authentication and error handling
* `src/utils/` — Shared utilities
* `src/migrate.js` — Database migration entry point
* `src/seed.js` — Development seed logic
* `tests/` — Automated tests
* `supabase-schema.sql` — PostgreSQL schema

---

## 📄 License

This project is distributed under the license specified by the main NexusHR repository.

See the repository license for complete terms.

---

## 👨‍💻 Author

Developed by **AbdullahSoftDev**

GitHub:

[github.com/AbdullahSoftDev](https://github.com/AbdullahSoftDev)

---

<div align="center">

### 🏢 NexusHR Backend

**Secure APIs. Structured data. Smarter HR operations.**

</div>
