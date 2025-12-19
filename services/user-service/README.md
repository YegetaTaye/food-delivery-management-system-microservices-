# User Service

User authentication and management microservice for the food delivery platform. Handles user registration, authentication, JWT token generation, and user CRUD operations.

## ✨ Features

- **User Authentication** - Signup, login, refresh token, password change
- **User Management** - Create, read, update, delete users with pagination and search
- **JWT Authentication** - Access tokens and refresh tokens for secure API access
- **Password Security** - Bcrypt password hashing
- **MySQL Database** - Prisma ORM with MySQL
- **Input Validation** - Joi schema validation
- **API Documentation** - Swagger/OpenAPI documentation
- **TypeScript** - Type-safe codebase
- **Winston Logger** - Structured logging
- **Health Check** - Built-in health endpoint

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MySQL database
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
npm run prisma:migrate
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
SERVICE_NAME=user-service
NODE_ENV=development

# Database
DATABASE_URL="mysql://user:password@localhost:3306/user_service_db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### 4. Run in Development

```bash
npm run dev
```

The service will start on `http://localhost:3000`

### 5. Access Documentation

- **API Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 📝 Available Scripts

| Script              | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Build TypeScript to JavaScript           |
| `npm start`         | Start production server                  |
| `npm run prisma:generate` | Generate Prisma Client            |
| `npm run prisma:migrate`  | Run database migrations          |
| `npm run prisma:studio`   | Open Prisma Studio GUI          |

## 📚 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `GET /api/auth/me` - Get current authenticated user (🔒 requires auth)
- `POST /api/auth/change-password` - Change user password (🔒 requires auth)

### Users

- `GET /api/users` - Get all users with pagination (🔒 requires auth)
  - Query params: `page`, `limit`
- `GET /api/users/search` - Search users by name or email (🔒 requires auth)
  - Query params: `q` (required), `page`, `limit`
- `GET /api/users/:id` - Get user by ID (🔒 requires auth)
- `POST /api/users` - Create a new user (🔒 requires auth)
- `PUT /api/users/:id` - Update user (🔒 requires auth)
- `DELETE /api/users/:id` - Delete user (🔒 requires auth)

### Health

- `GET /health` - Health check (public)

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Token Types

- **Access Token**: Expires in 7 days (default), used for API requests
- **Refresh Token**: Expires in 30 days (default), used to get new access tokens

## 📁 Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── env.ts              # Environment configuration
│   │   └── swagger.ts          # Swagger setup
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   ├── health.controller.ts
│   │   └── user.controller.ts  # User management logic
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT authentication middleware
│   │   ├── error.middleware.ts # Global error handler
│   │   └── validate.middleware.ts # Request validation
│   ├── routes/
│   │   ├── auth.routes.ts      # Authentication routes
│   │   ├── health.route.ts
│   │   └── user.routes.ts      # User management routes
│   ├── services/
│   │   ├── auth.service.ts     # Authentication business logic
│   │   └── user.service.ts     # User business logic
│   ├── types/
│   │   └── AppError.ts         # Error types
│   ├── utils/
│   │   ├── logger.ts           # Winston logger
│   │   └── jwt.util.ts         # JWT utilities
│   ├── validations/
│   │   └── user.validation.ts  # Joi validation schemas
│   ├── app.ts                  # Express app setup
│   └── index.ts                # Server entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── docs/
│   └── swagger.json            # Auto-generated API docs
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### User Model

```prisma
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

## 🐳 Docker

### Build Image

```bash
docker build -t user-service:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e SERVICE_NAME=user-service \
  -e NODE_ENV=production \
  -e DATABASE_URL="mysql://user:password@host:3306/db" \
  -e JWT_SECRET="your-secret-key" \
  -e JWT_EXPIRES_IN=7d \
  -e JWT_REFRESH_EXPIRES_IN=30d \
  user-service:latest
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  user-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - SERVICE_NAME=user-service
      - NODE_ENV=production
      - DATABASE_URL=mysql://user:password@mysql:3306/user_service_db
      - JWT_SECRET=your-super-secret-jwt-key
      - JWT_EXPIRES_IN=7d
      - JWT_REFRESH_EXPIRES_IN=30d
    depends_on:
      - mysql
```

## 📦 Dependencies

### Production:

- `express` - Web framework
- `@prisma/client` - Prisma ORM client
- `jsonwebtoken` - JWT token generation and verification
- `bcryptjs` - Password hashing
- `joi` - Input validation
- `dotenv` - Environment variables
- `winston` - Logging
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `swagger-ui-express` - API documentation UI
- `swagger-jsdoc` - Swagger spec generation

### Development:

- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot reload
- `prisma` - Prisma CLI
- `@types/*` - Type definitions

## 🔄 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
SERVICE_NAME=user-service
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### Build for Production

```bash
npm run build
npm start
```

## 🔒 Security Features

- **Password Hashing**: Bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Helmet**: HTTP security headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Joi schema validation
- **Error Handling**: Prevents information leakage in production

## 📊 Logging

Winston logger includes:

- Timestamp on all logs
- Service name in metadata
- Colored console output in development
- JSON format for production
- Request logging middleware

### Usage:

```typescript
import logger from './utils/logger';

logger.info('User created', { userId: '123' });
logger.error('Failed to process', { error: err.message });
```

## 🤝 Integration with Other Services

This service provides JWT tokens that can be used by other microservices (product-service, order-service, etc.) to authenticate requests. All services should use the same `JWT_SECRET` for token verification.

## 📄 License

ISC
