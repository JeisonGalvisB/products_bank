# Database Documentation

## Overview

- **Database Name:** `products_bank`
- **DBMS:** MySQL 8.0
- **Charset:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **ORM:** Sequelize 6.x

---

## Database Structure

### Tables

1. **roles** - User roles
2. **usuarios** - System users
3. **productos_tipos** - Financial product types
4. **franquicias** - Credit card franchises
5. **ventas** - Sales records

---

## Table Schemas

### 1. roles

User roles (Admin, Advisor)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Role ID |
| nombre | VARCHAR(50) | NOT NULL, UNIQUE | Role name |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Update timestamp |

**Data:**
- 1 - Administrador
- 2 - Asesor

---

### 2. usuarios

System users with authentication

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | User ID |
| nombre | VARCHAR(100) | NOT NULL | User full name |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Email (login) |
| password | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| rolId | INT | NOT NULL, FK → roles(id) | User role |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- UNIQUE: `email`
- FOREIGN KEY: `rolId` → `roles(id)` ON DELETE CASCADE

**Default User:**
- Email: admin@productsbank.com
- Password: Admin123! (hashed)
- Role: Administrador

---

### 3. productos_tipos

Financial product types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Product ID |
| nombre | VARCHAR(100) | NOT NULL, UNIQUE | Product name |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Update timestamp |

**Data:**
- 1 - Crédito de Consumo
- 2 - Libranza Libre Inversión
- 3 - Tarjeta de Crédito

---

### 4. franquicias

Credit card franchises

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Franchise ID |
| nombre | VARCHAR(50) | NOT NULL, UNIQUE | Franchise name |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Update timestamp |

**Data:**
- 1 - AMEX
- 2 - VISA
- 3 - MASTERCARD

---

### 5. ventas

Sales records with conditional validations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Sale ID |
| productoId | INT | NOT NULL, FK → productos_tipos(id) | Product type |
| cupoSolicitado | DECIMAL(15,2) | NOT NULL | Requested amount |
| franquiciaId | INT | NULL, FK → franquicias(id) | Franchise (credit cards only) |
| tasa | DECIMAL(5,2) | NULL | Interest rate % (credits only) |
| estado | ENUM | NOT NULL, DEFAULT 'OPEN' | Status: OPEN, IN_PROCESS, FINISHED |
| usuarioCreadorId | INT | NOT NULL, FK → usuarios(id) | Creator user ID |
| createdAt | DATETIME | NOT NULL | Creation timestamp |
| updatedAt | DATETIME | NOT NULL | Update timestamp |

**Indexes:**
- PRIMARY KEY: `id`
- FOREIGN KEY: `productoId` → `productos_tipos(id)` ON DELETE CASCADE
- FOREIGN KEY: `franquiciaId` → `franquicias(id)` ON DELETE SET NULL
- FOREIGN KEY: `usuarioCreadorId` → `usuarios(id)` ON DELETE CASCADE
- INDEX: `productoId`
- INDEX: `usuarioCreadorId`
- INDEX: `estado`

**Business Rules:**
- If `productoId = 3` (Credit Card): `franquiciaId` is REQUIRED, `tasa` is NULL
- If `productoId = 1 or 2` (Credits): `tasa` is REQUIRED, `franquiciaId` is NULL

---

## Entity Relationships

```
roles (1) ----< (N) usuarios
usuarios (1) ----< (N) ventas
productos_tipos (1) ----< (N) ventas
franquicias (1) ----< (N) ventas [optional]
```

### Relationship Details

1. **roles → usuarios** (One-to-Many)
   - One role can have many users
   - Each user has exactly one role
   - ON DELETE CASCADE

2. **usuarios → ventas** (One-to-Many)
   - One user can create many sales
   - Each sale has exactly one creator
   - ON DELETE CASCADE

3. **productos_tipos → ventas** (One-to-Many)
   - One product type can have many sales
   - Each sale has exactly one product
   - ON DELETE CASCADE

4. **franquicias → ventas** (One-to-Many, Optional)
   - One franchise can have many sales
   - Sales only have franchise if product is Credit Card
   - ON DELETE SET NULL

---

## Migrations

Migrations are located in: `backend/src/migrations/`

### Running Migrations

```bash
# From project root
npm run migrate

# Or from backend directory
cd backend
npm run migrate
```

### Migration Files

1. `01-create-roles.js` - Creates roles table
2. `02-create-usuarios.js` - Creates usuarios table
3. `03-create-productos-tipos.js` - Creates productos_tipos table
4. `04-create-franquicias.js` - Creates franquicias table
5. `05-create-ventas.js` - Creates ventas table

### Rollback

```bash
# Undo last migration
npm run migrate:undo

# Or from backend
cd backend
npm run migrate:undo
```

---

## Seeders

Seeders are located in: `backend/src/seeders/`

### Running Seeders

```bash
# From project root
npm run seed

# Or from backend directory
cd backend
npm run seed
```

### Seeder Files

1. `01-seed-roles.js` - Seeds roles (Administrador, Asesor)
2. `02-seed-usuarios.js` - Seeds admin user
3. `03-seed-productos-tipos.js` - Seeds product types
4. `04-seed-franquicias.js` - Seeds franchises
5. `05-seed-ventas.js` - Seeds sample sales (optional)

### Rollback

```bash
# Undo all seeds
npm run seed:undo

# Or from backend
cd backend
npm run seed:undo
```

---

## Database Setup

### Manual Setup

```bash
# 1. Create database
mysql -u root -p
```

```sql
CREATE DATABASE products_bank CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MySQL credentials

# 3. Run migrations
npm run migrate

# 4. Run seeders
npm run seed
```

### Docker Setup

Database is automatically created and initialized when using Docker:

```bash
docker-compose up
```

---

## Backup and Restore

### Backup

```bash
mysqldump -u root -p products_bank > backup.sql
```

### Restore

```bash
mysql -u root -p products_bank < backup.sql
```

---

## Indexes and Performance

### Recommended Indexes (already created)

1. **ventas.productoId** - Frequent filtering by product type
2. **ventas.usuarioCreadorId** - Role-based access control filtering
3. **ventas.estado** - Status filtering
4. **usuarios.email** - Unique index for login queries

### Query Optimization

All queries use Sequelize's query optimization:
- Selective column projection
- Proper JOIN strategies
- Index utilization for WHERE clauses
- Pagination for large result sets

---

## Data Validation

### Application Level (Sequelize Models)

- Type validation
- Length constraints
- Unique constraints
- NOT NULL enforcement

### Database Level (MySQL)

- Foreign key constraints
- ENUM validation
- Default values
- Charset/collation enforcement

### Business Logic Level (Services)

- Conditional field requirements
- Role-based access control
- Cross-field validation
- Email uniqueness checks