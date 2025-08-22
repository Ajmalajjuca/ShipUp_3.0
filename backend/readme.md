# Logistics Platform API

A complete logistics and delivery platform built with Node.js, TypeScript, MongoDB, and Express.js using a monolithic architecture with clean code principles.

## Features

- 🔐 **Authentication System** - JWT-based auth with role-based access control
- 👥 **User Management** - Customer, delivery partner, and admin management
- 📦 **Order Management** - Complete order lifecycle with real-time tracking
- 📍 **Location Tracking** - Real-time GPS tracking for delivery partners
- 🎯 **Admin Panel** - Comprehensive admin dashboard capabilities
- 🔄 **Real-time Updates** - WebSocket integration for live updates
- 📱 **OTP Verification** - Secure pickup and delivery verification
- ⭐ **Rating System** - Customer and delivery partner ratings
- 🗺️ **Geospatial Queries** - Find nearby delivery partners and orders

## Tech Stack

- **Backend**: Node.js, TypeScript, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Validation**: Joi
- **Real-time**: Socket.io
- **File Uploads**: Multer
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, TypeScript

## Architecture

The application follows a clean monolithic architecture with:

```
src/
├── auth/           # Authentication module
├── users/          # User management module
├── orders/         # Order management module
├── locations/      # Location tracking module
└── shared/         # Shared utilities and middleware
```

Each module follows the pattern:
- **Controllers** - Handle HTTP requests/responses
- **Services** - Business logic layer
- **Repositories** - Data access layer
- **Models** - Database schemas
- **Validators** - Request validation schemas

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd logistics-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Create required directories**
```bash
mkdir -p logs uploads
```

5. **Start MongoDB**
```bash
# If using local MongoDB
mongod

# Or start MongoDB service
sudo systemctl start mongod
```

6. **Run the application**
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with OTP |
| POST | `/auth/change-password` | Change password (authenticated) |
| POST | `/auth/request-otp` | Request OTP verification |
| POST | `/auth/verify-otp` | Verify OTP |
| GET | `/auth/profile` | Get user profile |
| POST | `/auth/logout` | Logout user |

### User Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get current user profile |
| PUT | `/users/profile` | Update user profile |
| GET | `/users/addresses` | Get user addresses |
| POST | `/users/addresses` | Add new address |
| PUT | `/users/addresses/:id` | Update address |
| DELETE | `/users/addresses/:id` | Delete address |
| GET | `/users/delivery-partners` | Get delivery partners |
| PUT | `/users/delivery-partner/online-status` | Update online status |

### Order Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create new order |
| GET | `/orders/my-orders` | Get customer orders |
| GET | `/orders/my-deliveries` | Get delivery partner orders |
| GET | `/orders/available` | Get available orders |
| PUT | `/orders/:id/accept` | Accept order (delivery partner) |
| PUT | `/orders/:id/status` | Update order status |
| POST | `/orders/:id/verify-pickup` | Verify pickup OTP |
| POST | `/orders/:id/verify-delivery` | Verify delivery OTP |
| PUT | `/orders/:id/cancel` | Cancel order |
| PUT | `/orders/:id/rate` | Rate order |

### Location Tracking Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/locations/update` | Update location |
| GET | `/locations/latest/:userId` | Get latest location |
| GET | `/locations/history/:userId` | Get location history |
| GET | `/locations/delivery-partners/nearby` | Find nearby delivery partners |
| GET | `/locations/track/:orderId` | Track order location |

## WebSocket Events

### Connection
```javascript
// Client connection with JWT token
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### For Delivery Partners
- `location_update` - Send location updates
- `online_status` - Update online/offline status
- `delivery_location_update` - Receive real-time location during delivery

#### For Customers
- `order_update` - Receive order status updates
- `delivery_location_update` - Track delivery partner location

#### General Events
- `notification` - Receive notifications
- `new_message` - Chat messages
- `ping/pong` - Connection health check

## Database Schema

### User Schema
```typescript
{
  firstName: string
  lastName: string
  email: string (unique)
  phone: string (unique)
  password: string (hashed)
  role: 'customer' | 'delivery_partner' | 'admin'
  isActive: boolean
  isVerified: boolean
  addresses: Address[]
  deliveryPartnerInfo?: DeliveryPartnerInfo
}
```

### Order Schema
```typescript
{
  orderNumber: string (unique)
  customerId: ObjectId
  deliveryPartnerId?: ObjectId
  items: OrderItem[]
  pickupAddress: Address
  deliveryAddress: Address
  status: OrderStatus
  pricing: Pricing
  timeline: TimelineEntry[]
}
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Development Scripts

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Clean build directory
npm run clean
```

## Deployment

### Using PM2 (Recommended)

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create ecosystem file**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'logistics-platform',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

3. **Deploy**
```bash
npm run build
pm2 start ecosystem.config.js
```

### Using Docker

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY uploads ./uploads

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

## Environment Variables

See `.env.example` for all required environment variables.

### Critical Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret (use strong random string)
- `NODE_ENV` - Environment (development/production)

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Password hashing with bcrypt
- OTP verification for sensitive operations

## Performance Optimizations

- Database indexing for frequently queried fields
- Connection pooling
- Compression middleware
- Pagination for large datasets
- Efficient geospatial queries
- Memory-efficient file handling

## Monitoring and Logging

- Winston logger with multiple transports
- Request/response logging
- Error tracking with stack traces
- Performance monitoring
- Health check endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the repository.

---

## API Response Format

All API responses follow this format:

```typescript
{
  success: boolean
  message: string
  data?: any
  error?: string
  timestamp: Date
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- OTP requests: 3 requests per minute

## Future Enhancements

- [ ] Payment gateway integration
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] Multi-language support
- [ ] Advanced routing algorithms
- [ ] Integration with mapping services
- [ ] Automated testing pipeline
- [ ] Load balancing setup