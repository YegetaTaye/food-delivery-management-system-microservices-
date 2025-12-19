# Product Service

Menu and category management microservice for the food delivery platform. Handles menu items, categories, and stock management with JWT authentication.

## ✨ Features

- **Menu Items Management** - CRUD operations for menu items
- **Categories Management** - Create and manage food categories
- **Stock Management** - Reserve and release stock for orders
- **JWT Authentication** - Protected endpoints using JWT tokens from user-service
- **MySQL Database** - Prisma ORM with MySQL
- **Input Validation** - Joi schema validation
- **API Versioning** - RESTful API with version support (v1)
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

(Optional) Seed sample data:

```bash
npm run prisma:seed
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4300
SERVICE_NAME=product-service
NODE_ENV=development
API_VERSION=v1

# Database
DATABASE_URL="mysql://user:password@localhost:3306/product_service_db"

# JWT Configuration (must match user-service JWT_SECRET)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

### 4. Run in Development

```bash
npm run dev
```

The service will start on `http://localhost:4300`

### 5. Access Documentation

- **API Docs**: http://localhost:4300/docs
- **Health Check**: http://localhost:4300/health

## 📝 Available Scripts

| Script                    | Description                              |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Start development server with hot reload |
| `npm run build`           | Build TypeScript to JavaScript           |
| `npm start`               | Start production server                  |
| `npm run prisma:generate` | Generate Prisma Client                   |
| `npm run prisma:migrate`  | Run database migrations                  |
| `npm run prisma:migrate:prod` | Deploy migrations in production     |
| `npm run prisma:studio`   | Open Prisma Studio GUI                   |
| `npm run prisma:seed`     | Seed database with sample data           |

## 📚 API Endpoints

All endpoints are prefixed with `/api/v1` (configurable via `API_VERSION`).

### Menu Items

- `GET /api/v1/menu-items` - List all menu items (public)
  - Query params: `categoryId` (filter by category), `isAvailable` (filter by availability)
- `GET /api/v1/menu-items/:id` - Get menu item by ID (public)
- `POST /api/v1/menu-items` - Create a new menu item (🔒 requires auth)
- `PUT /api/v1/menu-items/:id` - Update menu item (🔒 requires auth)
- `DELETE /api/v1/menu-items/:id` - Delete menu item (🔒 requires auth)

### Stock Management

- `POST /api/v1/menu-items/stock/reserve` - Reserve stock for an order (🔒 requires auth)
  - Request body: `{ items: [{ menuItemId: string, quantity: number }] }`
- `POST /api/v1/menu-items/stock/release` - Release reserved stock (🔒 requires auth)
  - Request body: `{ items: [{ menuItemId: string, quantity: number }] }`

### Categories

- `GET /api/v1/categories` - List all categories (public)
- `GET /api/v1/categories/:id` - Get category by ID with menu items (public)
- `POST /api/v1/categories` - Create a new category (🔒 requires auth)
- `PUT /api/v1/categories/:id` - Update category (🔒 requires auth)
- `DELETE /api/v1/categories/:id` - Delete category (only if empty) (🔒 requires auth)

### Health

- `GET /health` - Health check (public)

## 🔐 Authentication

Protected endpoints (create, update, delete, stock operations) require JWT token from user-service. Add token to requests:

```bash
Authorization: Bearer <your-jwt-token>
```

The JWT token should be obtained from the user-service authentication endpoints.

## 📁 Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── database.ts         # Database connection
│   │   ├── env.ts              # Environment configuration
│   │   └── swagger.ts          # Swagger setup
│   ├── controllers/
│   │   ├── category.controller.ts  # Category logic
│   │   ├── health.controller.ts
│   │   └── menu.controller.ts      # Menu item logic
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT authentication middleware
│   │   ├── error.middleware.ts # Global error handler
│   │   └── validate.middleware.ts # Request validation
│   ├── routes/
│   │   ├── category.route.ts   # Category routes
│   │   ├── health.route.ts
│   │   └── menu.route.ts       # Menu item routes
│   ├── types/
│   │   └── AppError.ts         # Error types
│   ├── utils/
│   │   └── logger.ts           # Winston logger
│   ├── validations.ts          # Joi validation schemas
│   ├── app.ts                  # Express app setup
│   └── index.ts                # Server entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seed script
│   └── migrations/             # Database migrations
├── docs/
│   └── swagger.json            # Auto-generated API docs
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🗄️ Database Schema

### Category Model

```prisma
model Category {
  id          String     @id @default(uuid())
  name        String     @unique
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  menuItems   MenuItem[]
}
```

### MenuItem Model

```prisma
model MenuItem {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Decimal  @db.Decimal(10, 2)
  imageUrl    String?
  stock       Int      @default(0)
  isAvailable Boolean  @default(true)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🐳 Docker

### Build Image

```bash
docker build -t product-service:latest .
```

### Run Container

```bash
docker run -p 4300:4300 \
  -e PORT=4300 \
  -e SERVICE_NAME=product-service \
  -e NODE_ENV=production \
  -e API_VERSION=v1 \
  -e DATABASE_URL="mysql://user:password@host:3306/db" \
  -e JWT_SECRET="your-secret-key" \
  -e JWT_EXPIRES_IN=7d \
  -e JWT_REFRESH_EXPIRES_IN=30d \
  product-service:latest
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  product-service:
    build: .
    ports:
      - "4300:4300"
    environment:
      - PORT=4300
      - SERVICE_NAME=product-service
      - NODE_ENV=production
      - API_VERSION=v1
      - DATABASE_URL=mysql://user:password@mysql:3306/product_service_db
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
- `jsonwebtoken` - JWT token verification
- `joi` - Input validation
- `uuid` - UUID generation
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
- `ts-node` - TypeScript execution for seed scripts
- `@types/*` - Type definitions

## 🔄 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4300
SERVICE_NAME=product-service
API_VERSION=v1
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

### Database Migrations

For production, use:

```bash
npm run prisma:migrate:prod
```

## 🔒 Security Features

- **JWT Authentication**: Token-based authentication for protected endpoints
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

## 🤝 Integration with Other Services

This service integrates with:

- **user-service**: Uses JWT tokens issued by user-service for authentication. Both services must share the same `JWT_SECRET`.
- **order-service**: Receives stock reservation/release requests from order-service when orders are created/cancelled.

## 📝 Stock Management

Stock operations are designed to work with the order service:

1. **Reserve Stock**: Called when an order is placed to decrease available stock
2. **Release Stock**: Called when an order is cancelled to restore stock

Both operations support batch processing of multiple menu items.

## 📄 License

ISC
