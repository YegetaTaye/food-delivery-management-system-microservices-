# Product Service (Food Delivery)

Menu and category management for food delivery platform.

## Setup

```bash
npm install
npm run prisma:generate
cp .env.example .env  # Edit with your DB credentials
npm run prisma:migrate
npm run prisma:seed   # Optional: seed sample data
```

## Run

```bash
npm run dev   # Development
npm start     # Production
```

## API Endpoints

### Menu Items
- `GET /menu-items` - List all (filter: `?categoryId=&isAvailable=`)
- `GET /menu-items/:id` - Get by ID
- `POST /menu-items` - Create
- `PUT /menu-items/:id` - Update
- `DELETE /menu-items/:id` - Delete
- `POST /menu-items/stock/reserve` - Reserve stock
- `POST /menu-items/stock/release` - Release stock

### Categories
- `GET /categories` - List all
- `GET /categories/:id` - Get by ID (includes menu items)
- `POST /categories` - Create
- `PUT /categories/:id` - Update
- `DELETE /categories/:id` - Delete

### Health
- `GET /health` - Health check

## Docs

Swagger UI: `http://localhost:4300/docs`
