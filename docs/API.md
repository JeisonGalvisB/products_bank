# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/login` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@productsbank.com",
  "password": "Admin123!",
  "recaptchaToken": "token_from_recaptcha"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "nombre": "Admin",
      "email": "admin@productsbank.com",
      "rolId": 1,
      "rol": {
        "id": 1,
        "nombre": "Administrador"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Verify Token

```http
GET /api/auth/verify
```

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "email": "admin@productsbank.com",
    "rolId": 1
  }
}
```

---

## User Endpoints (Admin Only)

### Get All Users

```http
GET /api/users
```

**Query Parameters:**
- `search` (optional) - Search by name or email
- `rolId` (optional) - Filter by role ID
- `page` (optional) - Page number
- `limit` (optional) - Items per page

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### Get User by ID

```http
GET /api/users/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "nombre": "Admin",
    "email": "admin@productsbank.com",
    "rolId": 1,
    "rol": {
      "id": 1,
      "nombre": "Administrador"
    }
  }
}
```

### Create User

```http
POST /api/users
```

**Request Body:**
```json
{
  "nombre": "Juan Perez",
  "email": "juan@example.com",
  "password": "Password123!",
  "rolId": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 5,
    "nombre": "Juan Perez",
    "email": "juan@example.com",
    "rolId": 2
  }
}
```

### Update User

```http
PUT /api/users/:id
```

**Request Body (all optional):**
```json
{
  "nombre": "Juan Perez Updated",
  "email": "juan.new@example.com",
  "password": "NewPassword123!",
  "rolId": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {...}
}
```

### Delete User

```http
DELETE /api/users/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

## Sale Endpoints

### Get All Sales

```http
GET /api/sales
```

**Query Parameters:**
- `productoId` (optional) - Filter by product
- `estado` (optional) - Filter by status (OPEN, IN_PROCESS, FINISHED)
- `startDate` (optional) - Filter from date (YYYY-MM-DD)
- `endDate` (optional) - Filter to date (YYYY-MM-DD)
- `usuarioCreadorId` (optional) - Filter by creator (admin only)
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Sales retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

### Get Sale by ID

```http
GET /api/sales/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sale retrieved successfully",
  "data": {
    "id": 1,
    "productoId": 1,
    "productoNombre": "Crédito de Consumo",
    "cupoSolicitado": 5000000,
    "franquiciaId": null,
    "tasa": 15.5,
    "estado": "OPEN",
    "usuarioCreadorId": 2,
    "usuarioCreador": "Maria Garcia"
  }
}
```

### Create Sale

```http
POST /api/sales
```

**Request Body:**
```json
{
  "productoId": 1,
  "cupoSolicitado": 5000000,
  "franquiciaId": null,
  "tasa": 15.5,
  "estado": "OPEN"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {...}
}
```

### Update Sale

```http
PUT /api/sales/:id
```

**Request Body (all optional):**
```json
{
  "productoId": 1,
  "cupoSolicitado": 6000000,
  "franquiciaId": null,
  "tasa": 14.5,
  "estado": "IN_PROCESS"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sale updated successfully",
  "data": {...}
}
```

### Delete Sale

```http
DELETE /api/sales/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sale deleted successfully",
  "data": null
}
```

### Get Total Amount

```http
GET /api/sales/stats/total
```

**Query Parameters:**
- `productoId` (optional)
- `estado` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Total amount calculated successfully",
  "data": {
    "total": 45000000
  }
}
```

### Get Count by Status

```http
GET /api/sales/stats/count-by-status
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sales count by status retrieved successfully",
  "data": [
    { "estado": "OPEN", "count": 5 },
    { "estado": "IN_PROCESS", "count": 3 },
    { "estado": "FINISHED", "count": 10 }
  ]
}
```

### Get My Sales

```http
GET /api/sales/my-sales
```

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "My sales retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {...}
  }
}
```

---

## Product Endpoints

### Get All Products

```http
GET /api/products
```

**Response (200):**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    { "id": 1, "nombre": "Crédito de Consumo" },
    { "id": 2, "nombre": "Libranza Libre Inversión" },
    { "id": 3, "nombre": "Tarjeta de Crédito" }
  ]
}
```

### Get Product by ID

```http
GET /api/products/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "nombre": "Crédito de Consumo"
  }
}
```

---

## Franchise Endpoints

### Get All Franchises

```http
GET /api/franchises
```

**Response (200):**
```json
{
  "success": true,
  "message": "Franchises retrieved successfully",
  "data": [
    { "id": 1, "nombre": "AMEX" },
    { "id": 2, "nombre": "VISA" },
    { "id": 3, "nombre": "MASTERCARD" }
  ]
}
```

---

## Statistics Endpoints

### Get Dashboard Stats

```http
GET /api/stats/dashboard
```

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalSales": 150,
    "totalAmount": 450000000,
    "averageAmount": 3000000,
    "salesByStatus": {...},
    "salesByProduct": {...},
    "topAdvisors": [...]
  }
}
```

### Get Sales by Product

```http
GET /api/stats/by-product
```

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Sales by product retrieved successfully",
  "data": [
    {
      "productoId": 1,
      "productoNombre": "Crédito de Consumo",
      "totalSales": 50,
      "totalAmount": 150000000
    }
  ]
}
```

### Get Sales by Advisor (Admin Only)

```http
GET /api/stats/by-advisor
```

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response (200):**
```json
{
  "success": true,
  "message": "Sales by advisor retrieved successfully",
  "data": [
    {
      "usuarioId": 2,
      "usuarioNombre": "Maria Garcia",
      "totalSales": 30,
      "totalAmount": 90000000
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": []
  }
}
```

### Common Error Codes

- `AUTHENTICATION_ERROR` (401) - Invalid or expired token
- `AUTHORIZATION_ERROR` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid request data
- `NOT_FOUND` (404) - Resource not found
- `SERVER_ERROR` (500) - Internal server error

---

## Validation Rules

### User
- `nombre`: Required, 2-100 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, must include uppercase, lowercase, number, and special character
- `rolId`: Required, must exist (1=Admin, 2=Advisor)

### Sale
- `productoId`: Required, must exist
- `cupoSolicitado`: Required, positive number
- `franquiciaId`: Required only for Credit Card (productoId=3)
- `tasa`: Required for Consumer Credit (productoId=1) and Payroll (productoId=2)
- `estado`: Optional, one of: OPEN, IN_PROCESS, FINISHED