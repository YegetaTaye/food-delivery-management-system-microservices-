# Food Delivery Frontend - Microservices Demo

A React frontend application demonstrating the workflow of a distributed microservices system.

## Purpose

This frontend visualizes and interacts with the following backend microservices workflow:

```
User → Product → Cart → Order → Payment → Notification
```

The UI is intentionally minimal - the focus is on **correctness of flow and API interaction**.

## Architecture

### Frontend ↔ Backend Integration

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    React App    │────▶│   API Gateway   │────▶│  Microservices  │
│   (Port 3000)   │     │   (Port 8080)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                 ├─ User Service
                                                 ├─ Product Service
                                                 ├─ Order Service
                                                 ├─ Payment Service
                                                 └─ Notification Service
```

### API Endpoints

All requests go through the API Gateway at `/api/v1`:

| Endpoint | Service | Description |
|----------|---------|-------------|
| `POST /api/v1/auth/login` | User Service | Login, returns JWT |
| `POST /api/v1/auth/register` | User Service | Register, returns JWT |
| `GET /api/v1/users/me` | User Service | Get current user profile |
| `GET /api/v1/products` | Product Service | List all products |
| `POST /api/v1/orders` | Order Service | Create new order |
| `GET /api/v1/orders/:id` | Order Service | Get order details |
| `POST /api/v1/payments` | Payment Service | Process payment |

### Authentication Flow

1. User submits credentials to `/api/v1/auth/login`
2. User Service validates and returns JWT token
3. Frontend stores JWT in localStorage
4. All subsequent requests include `Authorization: Bearer <JWT>`

### Cart Handling

**Important:** Cart is managed **entirely on the frontend**:
- Stored in React Context (memory)
- No backend Cart Service calls
- Resets on page refresh

This demonstrates separation of concerns - not all state needs backend persistence.

### Order & Payment Flow

1. User adds products to cart (frontend only)
2. User clicks "Place Order"
3. Frontend calls Order Service → creates order with `PENDING` status
4. Order Service publishes `orders.created` event
5. Frontend calls Payment Service → simulates payment
6. Payment Service publishes `payments.completed` event
7. Backend async: Order status updated, notification sent
8. Frontend displays confirmation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.tsx       # App shell with navigation
├── context/             # React Context providers
│   ├── AuthContext.tsx  # JWT & user state management
│   └── CartContext.tsx  # Frontend-only cart state
├── pages/               # Route components
│   ├── LoginPage.tsx    # Auth: User Service
│   ├── SignupPage.tsx   # Auth: User Service
│   ├── ProductsPage.tsx # Browse: Product Service
│   ├── CartPage.tsx     # Cart: Frontend only
│   ├── CheckoutPage.tsx # Order + Payment Services
│   ├── ConfirmationPage.tsx # Order confirmation
│   └── OrdersPage.tsx   # Order history
├── services/            # API layer
│   └── api.ts           # All microservice API calls
├── styles/              # CSS
│   └── global.css       # Global styles
├── types/               # TypeScript definitions
│   └── index.ts         # API response types
├── App.tsx              # Router configuration
└── main.tsx             # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend services running (API Gateway at port 8080)

### Installation

```bash
cd services/frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Build

```bash
npm run build
```

## State Management

Uses React Context (no Redux):

- **AuthContext**: JWT token, user object, login/logout functions
- **CartContext**: Cart items, add/remove/update functions

Both contexts are accessible globally via hooks:
- `useAuth()` - authentication state and actions
- `useCart()` - cart state and actions

## Key Features

### Service Indicators

Each page displays which microservice it interacts with:
- Service name (e.g., "Product Service")
- API endpoint (e.g., "GET /api/v1/products")

### Event Flow Visualization

The checkout and confirmation pages show the backend event flow:
- `orders.created` → triggers stock reservation
- `payments.completed` → updates order status
- `notification.sent` → sends confirmation email

### Simulated Payment

Payment is **simulated** - no real transaction occurs. This demonstrates the payment service integration pattern without requiring actual payment gateway setup.

## Non-Goals (Explicitly Excluded)

- ❌ Complex UI styling
- ❌ Animations
- ❌ Backend logic
- ❌ WebSockets / real-time events
- ❌ Real payment integration
- ❌ Cart persistence to backend

## Configuration

### API Gateway URL

By default, the frontend proxies `/api` requests to `http://localhost:8080`.

To change this, modify `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://your-api-gateway:port',
    changeOrigin: true,
  },
},
```

## License

MIT

