# Node.js + Express + TypeScript Microservice Skeleton

A production-ready, reusable microservice skeleton built with Node.js, Express, and TypeScript. This template is designed for distributed microservices architectures and can be easily customized for different services.

## 🎯 Designed For

This skeleton can be reused for multiple microservices including:

- User Service
- Product Service
- Cart Service
- Order Service
- Payment Service
- Delivery Service
- Notification Service
- Analytics Service

## ✨ Features

- **TypeScript** - Type-safe code with strict mode enabled
- **Express.js** - Fast, unopinionated web framework
- **Winston Logger** - Structured logging with timestamps and JSON format
- **Swagger/OpenAPI** - Auto-generated API documentation
- **Docker** - Multi-stage builds for optimized container images
- **Error Handling** - Global error middleware with async support
- **Security** - Helmet and CORS enabled by default
- **Health Check** - Built-in health endpoint
- **Hot Reload** - Fast development with ts-node-dev

## 📁 Project Structure

```
.
├── src/
│   ├── config/
│   │   ├── env.ts           # Environment configuration
│   │   └── swagger.ts       # Swagger setup
│   ├── controllers/
│   │   └── health.controller.ts
│   ├── middlewares/
│   │   └── error.middleware.ts
│   ├── routes/
│   │   └── health.route.ts
│   ├── types/
│   │   └── AppError.ts
│   ├── utils/
│   │   └── logger.ts
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── docs/
│   └── swagger.json        # Auto-generated
├── .env.example
├── .dockerignore
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
SERVICE_NAME=UserService
NODE_ENV=development
```

### 3. Run in Development

```bash
npm run dev
```

The service will start on `http://localhost:3000`

### 4. Access Documentation

- **API Docs**: http://localhost:3000/docs
- **Health Check**: http://localhost:3000/health

## 📝 Available Scripts

| Script          | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript           |
| `npm start`     | Start production server                  |

## 🐳 Docker

### Build Image

```bash
docker build -t your-service-name:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e SERVICE_NAME="YourService" \
  -e PORT=3000 \
  your-service-name:latest
```

### Docker Compose Example

```yaml
version: "3.8"
services:
  user-service:
    build: .
    ports:
      - "3001:3000"
    environment:
      - SERVICE_NAME=UserService
      - PORT=3000
      - NODE_ENV=production
```

## 🔧 Customization Guide

### For Each New Service:

1. **Update Environment Variables**

   ```bash
   # In .env
   SERVICE_NAME=ProductService  # Change to your service name
   PORT=3001                    # Use different port if needed
   ```

2. **Add Your Routes**

   ```typescript
   // src/routes/product.route.ts
   import { Router } from "express";

   const router = Router();
   router.get("/products" /* your controller */);

   export default router;
   ```

3. **Register Routes in app.ts**

   ```typescript
   import productRoute from "./routes/product.route";
   this.app.use("/api", productRoute);
   ```

4. **Add Controllers**

   ```typescript
   // src/controllers/product.controller.ts
   export class ProductController {
     public static async getProducts(req: Request, res: Response) {
       // Your logic here
     }
   }
   ```

5. **Update Docker/Package Name**
   - Change `"name"` in `package.json`
   - Update Docker image tag when building

## 📚 API Documentation

Swagger documentation is automatically generated from JSDoc comments in your route files.

### Example Route Documentation:

```typescript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/products", ProductController.getProducts);
```

## 🔐 Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Ready for validation middleware (add express-validator)
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
import logger from "./utils/logger";

logger.info("User created", { userId: 123 });
logger.error("Failed to process", { error: err.message });
```

## 🧪 Adding Tests (Recommended)

Add to `package.json`:

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

## 🔄 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
SERVICE_NAME=YourService
# Add database URLs, API keys, etc.
```

### Build for Production

```bash
npm run build
npm start
```

## 📦 Dependencies

### Production:

- `express` - Web framework
- `dotenv` - Environment variables
- `winston` - Logging
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers
- `multer` - File uploads (ready for use)
- `swagger-ui-express` - API documentation UI
- `swagger-jsdoc` - Swagger spec generation

### Development:

- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server
- `@types/*` - Type definitions

## 🤝 Contributing

This is a template project. Customize it for your specific microservice needs.

## 📄 License

ISC

---

## 🎯 Service-Specific Examples

### User Service

```env
SERVICE_NAME=UserService
PORT=3001
```

### Product Service

```env
SERVICE_NAME=ProductService
PORT=3002
```

### Order Service

```env
SERVICE_NAME=OrderService
PORT=3003
```

And so on for Cart, Payment, Delivery, Notification, and Analytics services.

---

**Happy Coding! 🚀**
