# Products Bank - Financial Products Sales Management System

Complete web system for managing bank financial product sales with authentication, user roles, and CRUD operations.

## Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Test Users](#test-users)

## Description

Full-stack web application for managing bank financial product sales that allows:
- User authentication with JWT and Captcha
- User management (admin only)
- Sales management with dynamic validations
- Statistics dashboard
- Role-based permission control (Admin/Advisor)


## Features

### Authentication Module
- Login with email and password
- Google reCAPTCHA v2 protection
- JWT token validation with configurable expiration
- Role-based route protection

### User Module (Admin Only)
- List all users
- Create new users
- Edit existing users
- Delete users
- Unique email and secure password validations

### Sales Module
- Create sales with dynamic validations per product type
- List sales by role (admin sees all, advisor only their own)
- Edit and delete sales
- Total requested amount summary
- Status management (Open, In Process, Finished)

### Statistics Module
- Dashboard with main metrics
- Sales charts by product
- Sales charts by advisor
- Time period filters

## Tech Stack

### Backend
- **Runtime:** Node.js 20.x LTS
- **Framework:** Express.js 4.x
- **ORM:** Sequelize 6.x
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken)
- **Security:** bcrypt, helmet, cors, express-rate-limit
- **Validations:** express-validator
- **Logging:** Winston

### Frontend
- **Framework:** React 18.x
- **Routing:** React Router v6
- **State Management:** Redux Toolkit
- **UI Framework:** Material-UI (MUI) 5.x
- **Forms:** React Hook Form + Yup
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Captcha:** react-google-recaptcha

### DevOps
- **Containerization:** Docker + Docker Compose
- **Version Control:** Git

## Prerequisites

Before starting, make sure you have installed:

- **Node.js** >= 20.x LTS
- **npm** >= 10.x (included with Node.js)
- **MySQL** >= 8.0 
- **Git** 

## Installation

### Quick Start (Recommended for Development)

```bash
# 1. Clone the repository
git clone <repository-url>
cd products-bank

# 2. Install ALL dependencies at once
npm run install:all

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your configurations
# backend/.env - Database, JWT, reCAPTCHA secret
# frontend/.env - API URL, reCAPTCHA site key

# 4. Setup database
mysql -u root -p
# In MySQL console:
CREATE DATABASE products_bank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 5. Run migrations and seeds
npm run migrate
npm run seed

# 6. Start development (runs backend + frontend simultaneously)
npm run dev
```

### Alternative: Manual Installation

If you prefer to install dependencies separately:

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
npm run install:backend

# Install frontend dependencies
npm run install:frontend
```

## Configuration

### Environment Variables - Backend

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=products_bank
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_secret_jwt_key_minimum_32_characters
JWT_EXPIRATION=24h

BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### Environment Variables - Frontend

Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
REACT_APP_ENV=development
```

### Configure Google reCAPTCHA v2

1. Go to Google reCAPTCHA Admin
2. Register a new site with reCAPTCHA v2 (checkbox)
3. Copy the **Site Key** to `frontend/.env` → `REACT_APP_RECAPTCHA_SITE_KEY`
4. Copy the **Secret Key** to `backend/.env` → `RECAPTCHA_SECRET_KEY`

## Usage

### Option 1: Development Mode with Concurrently (Recommended)

Run both backend and frontend with a single command:

```bash
# From project root
npm run dev
```

This will start:
- ✅ Backend API at `http://localhost:5000`
- ✅ Frontend React app at `http://localhost:3000`
- Both processes in one terminal with color-coded logs

**Stop both:** Press `Ctrl+C` in the terminal

### Option 2: Development Mode (Separate Terminals)

If you prefer to run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Option 3: Using Docker (Production-like)

Run the entire stack (MySQL + Backend + Frontend) with Docker:

```bash
# First time: Copy docker environment file
cp .env.docker.example .env.docker
# Edit .env.docker with your reCAPTCHA keys

# Start all services
npm run docker:up
# Or: docker-compose up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Rebuild and start
npm run docker:build

# Clean everything (remove volumes)
npm run docker:clean
```

Access the application:
- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- MySQL: `localhost:3306`

### Production Mode (Manual)

```bash
# Backend
cd backend
npm start

# Frontend (build static files)
cd frontend
npm run build
# Serve the build folder with a web server (nginx, apache, etc.)
```

## Project Structure

```
products-bank/
├── backend/                  # Backend API
│   ├── src/
│   │   ├── config/          # Configurations
│   │   ├── models/          # Sequelize models
│   │   ├── controllers/     # Controllers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Middleware
│   │   ├── utils/           # Utilities
│   │   ├── migrations/      # DB migrations
│   │   └── seeders/         # DB seeds
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Pages
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilities
│   └── package.json
├── shared/                  # Shared code
├── docs/                    # Documentation
└── docker-compose.yml       # Docker configuration
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with captcha
- `GET /api/auth/verify` - Verify JWT token

### Users (Admin Only)

- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Sales

- `GET /api/sales` - List sales (filtered by role)
- `GET /api/sales/:id` - Get sale
- `POST /api/sales` - Create sale
- `PUT /api/sales/:id` - Update sale
- `DELETE /api/sales/:id` - Delete sale
- `GET /api/sales/stats/total` - Total amounts summary

### Products and Franchises

- `GET /api/products` - List products
- `GET /api/franchises` - List franchises

### Statistics

- `GET /api/stats/dashboard` - Dashboard metrics
- `GET /api/stats/by-product` - Sales by product
- `GET /api/stats/by-advisor` - Sales by advisor (admin only)
- `GET /api/stats/by-period` - Sales by period

For more details, see `docs/API.md`

## Test Users

### Administrator
- **Email:** admin@productsbank.com
- **Password:** Admin123!
- **Permissions:** Full access (users + sales)

### Advisors
Users with Advisor role must be created by an Administrator through the interface.

## Available Scripts

### Root (Recommended)

Run these from the project root directory:

```bash
# Development
npm run dev                 # Start backend + frontend simultaneously
npm run install:all         # Install all dependencies (root + backend + frontend)
npm run install:backend     # Install only backend dependencies
npm run install:frontend    # Install only frontend dependencies

# Database
npm run migrate             # Run migrations
npm run seed                # Run seeds
npm run migrate:undo        # Revert last migration
npm run seed:undo           # Revert seeds

# Docker
npm run docker:up           # Start all services with Docker
npm run docker:down         # Stop all Docker services
npm run docker:build        # Rebuild and start Docker services
npm run docker:logs         # View Docker logs
npm run docker:clean        # Stop and remove all volumes

# Individual starts
npm run start:backend       # Start only backend
npm run start:frontend      # Build and prepare frontend for production
```

### Backend (from backend/)

```bash
npm run dev          # Start in development mode with nodemon
npm start            # Start in production mode
npm run migrate      # Run database migrations
npm run migrate:undo # Revert last migration
npm run seed         # Run database seeders
npm run seed:undo    # Revert seeders
npm run lint         # Check code with ESLint
```

### Frontend (from frontend/)

```bash
npm start            # Start in development mode
npm run build        # Build for production
npm run lint         # Check code with ESLint
```

## Financial Products

The system manages 3 types of products with specific validations:

### 1. Consumer Credit (Crédito de Consumo)
- Requires: Requested amount + Rate (%)

### 2. Free Investment Payroll (Libranza Libre Inversión)
- Requires: Requested amount + Rate (%)

### 3. Credit Card (Tarjeta de Crédito)
- Requires: Requested amount + Franchise (AMEX, VISA, MASTERCARD)

## Roles and Permissions

### Administrator
- ✅ Access to user module (full CRUD)
- ✅ See all system sales
- ✅ Can create, edit, and delete any sale
- ✅ Access to all statistics

### Advisor
- ❌ No access to user module
- ✅ See only their own sales
- ✅ Can create, edit, and delete only their sales
- ✅ Access to their sales statistics

## Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

To report issues or request new features, please create an issue in the repository.
