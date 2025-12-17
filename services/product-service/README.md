# Product Service (Food Delivery)

Menu and category management for food delivery platform with JWT authentication.

## Setup

```bash
npm install
npm run prisma:generate
cp .env.example .env  # Edit with your DB credentials and JWT secret
npm run prisma:migrate
npm run prisma:seed   # Optional: seed sample data
```

## Run

```bash
npm run dev   # Development
npm start     # Production
```

## Authentication

Protected endpoints (create, update, delete) require JWT token from user service.

**Add token to requests:**
```bash
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Menu Items
- `GET /menu-items` - List all (public, filter: `?categoryId=&isAvailable=`)
- `GET /menu-items/:id` - Get by ID (public)
- `POST /menu-items` - Create (🔒 requires auth)
- `PUT /menu-items/:id` - Update (🔒 requires auth)
- `DELETE /menu-items/:id` - Delete (🔒 requires auth)
- `POST /menu-items/stock/reserve` - Reserve stock (🔒 requires auth)
- `POST /menu-items/stock/release` - Release stock (🔒 requires auth)

### Categories
- `GET /categories` - List all (public)
- `GET /categories/:id` - Get by ID (public)
- `POST /categories` - Create (🔒 requires auth)
- `PUT /categories/:id` - Update (🔒 requires auth)
- `DELETE /categories/:id` - Delete (🔒 requires auth)

### Health
- `GET /health` - Health check (public)

## Docs

Swagger UI: `http://localhost:4300/docs`

Use the "Authorize" button in Swagger to add your JWT token.

## Environment Variables

```env
PORT=4300
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/product_service"
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```
