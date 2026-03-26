# Backend - Hệ Thống Máy Chủ Quản Lý Rạp Chiếu Phim

## 📋 Giới Thiệu

Backend là thành phần máy chủ của hệ thống quản lý rạp chiếu phim META CINEMA. Nó cung cấp các API RESTful và Socket.io real-time để hỗ trợ cho ứng dụng web client và dashboard quản trị.

## 🛠️ Công Nghệ Sử Dụng

### Core
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5
- **Language**: JavaScript
- **Port**: Cấu hình trong file `.env`

### Database & Cache
- **Database**: Supabase (PostgreSQL)
- **Cache Layer**: Redis v5
- **Connection**: Pooling & Optimization

### Real-time Communication
- **WebSocket**: Socket.io v4
- **Message Queue**: RabbitMQ (AMQP)
- **Event-driven Architecture**: Pub/Sub Pattern

### Authentication & Security
- **JWT**: jsonwebtoken v9
- **Password Hashing**: Bcryptjs v3
- **Security Headers**: Helmet v8
- **CORS**: Cross-Origin Resource Sharing
- **Rate Limiting**: Express Rate Limit v8

### File Management
- **Cloud Storage**: Cloudinary v1
- **File Upload**: Multer v2
- **Storage Adapter**: Multer-storage-cloudinary

### Email & Notification
- **Email Service**: Nodemailer v7
- **Email Templates**: MJML (Mailjet Markup Language)
- **Real-time Notifications**: Socket.io

### Payment & QR
- **Payment Gateway**: VNPay,Momo
- **QR Code Generation**: qrcode v1

### Data & Export
- **Schema Validation**: Zod v4
- **Excel Export**: XLSX v0.18
- **Query Parsing**: qs v6

### Development
- **Auto Reload**: Nodemon v3

## 📁 Cấu Trúc Thư Mục

```
Backend/
├── config/              # Configuration files
│   ├── env.js          # Environment configuration
│   ├── supabase.js     # Database connection
│   ├── redis.js        # Cache configuration
│   ├── rabbitmq.js     # Message queue setup
│   ├── cloudary.js     # File storage config
│   ├── socket.js       # WebSocket setup
│   ├── payment/        # Payment configurations
│   └── paginate/       # Pagination config
├── controllers/         # Business logic controllers
│   ├── auth.controller.js
│   ├── movie.controller.js
│   ├── show_times.controller.js
│   ├── ticket.controller.js
│   ├── order.controller.js
│   ├── user.controller.js
│   ├── combo.controller.js
│   ├── event.controller.js
│   ├── payment/        # Payment controllers
│   └── ...
├── middlewares/         # Express middlewares
│   ├── auth.middleware.js        # JWT verification
│   ├── authorize.middleware.js   # Role-based authorization
│   ├── error.middleware.js       # Error handling
│   ├── rateLimit.middleware.js   # Rate limiting
│   ├── upload.middleware.js      # File upload handling
│   └── validate.middleware.js    # Data validation
├── repositories/        # Database queries
│   ├── user.repo.js
│   ├── movie.repo.js
│   ├── ticket.repo.js
│   ├── order.repo.js
│   └── ...
├── services/           # Business logic services
│   ├── email.service.js
│   ├── payment.service.js
│   ├── notification.service.js
│   └── ...
├── routes/             # API routes
│   ├── auth.routes.js
│   ├── movie.routes.js
│   ├── ticket.routes.js
│   ├── order.routes.js
│   └── ...
├── utils/              # Utility functions
├── validators/         # Zod schemas & validation
├── rabbitmq/           # Message queue
│   ├── producer.js
│   ├── consumer.js
│   └── exchange.js
├── redis/              # Cache management
│   ├── cache.js
│   ├── cacheKeys.js
│   └── tokenBucket.lua.js
├── supabase/          # Database utilities
├── scripts/           # Helper scripts
├── tests/             # Test files
├── uploads/           # Local file storage
├── public/            # Static files
├── app.js             # Express app setup
├── server.js          # Server entry point
├── package.json       # Dependencies
├── .env              # Environment variables
└── .gitignore        # Git ignore rules
```

## ⭐ Tính Năng Chính

### 1. Authentication & User Management
- ✅ User registration & login
- ✅ JWT token generation & validation
- ✅ Password hashing with bcrypt
- ✅ Password reset via email
- ✅ Multi-role authorization (Admin, Staff, Customer)

### 2. Movie Management
- ✅ Create, read, update, delete movies
- ✅ Movie categorization by type
- ✅ Movie poster & trailer management
- ✅ Coming soon & now showing tracking
- ✅ Movie ratings & reviews

### 3. Show Times & Seat Booking
- ✅ Show time schedule management
- ✅ Seat selection and availability
- ✅ Multiple theater rooms
- ✅ Seat type categorization (Standard, VIP, Couple)
- ✅ Real-time seat availability updates

### 4. Ticket Management
- ✅ Ticket generation with unique IDs
- ✅ QR code generation for tickets
- ✅ Ticket pricing management
- ✅ Dynamic pricing based on seat type
- ✅ Bulk ticket operations

### 5. Combo & Menu System
- ✅ Combo bundles creation
- ✅ Menu items management
- ✅ Combo items pricing
- ✅ Item availability tracking

### 6. Orders & Payments
- ✅ Shopping cart management
- ✅ Order creation & tracking
- ✅ VNPay payment integration
- ✅ Payment status verification
- ✅ Invoice generation
- ✅ Order history & cancellation

### 7. Events Management
- ✅ Special event creation
- ✅ Event type categorization
- ✅ Event-combo linking
- ✅ Event analytics

### 8. Discounts & Promotions
- ✅ Discount code management
- ✅ Promotion campaigns
- ✅ Discount validation & application
- ✅ Discount analytics

### 9. Real-time Chat & Notifications
- ✅ Real-time chat with Socket.io
- ✅ Conversation management
- ✅ Message storage
- ✅ Email notifications
- ✅ In-app notifications

### 10. Advanced Features
- ✅ AI Chatbot integration
- ✅ AI Booking recommendations
- ✅ AI Data Analysis
- ✅ Comment & rating system
- ✅ Post & blog management
- ✅ Statistical analytics & reports
- ✅ Action logging
- ✅ RabbitMQ message queuing
- ✅ Redis caching for performance
- ✅ XLSX data export

## 🔧 Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL (via Supabase)
- Redis server
- RabbitMQ server

### Installation Steps

1. **Clone & Install Dependencies**
```bash
cd Backend
npm install
```

2. **Environment Configuration**
```bash
# Create .env file with required variables
cp .env.example .env
```

Configure these variables:
```
# Server
PORT=5000
NODE_ENV=development

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE=your_service_role

# JWT
JWT_SECRET=your_jwt_secret

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# Cloudinary
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password

# VNPay
VNPAY_MERCHANT_ID=your_merchant_id
VNPAY_HASH_SECRET=your_hash_secret
```

3. **Run Development Server**
```bash
npm run dev
```

Server sẽ chạy trên http://localhost:5000 (hoặc port được cấu hình)

### Build & Production

```bash
# Production build
npm run build

# Start production server
NODE_ENV=production node server.js
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Sử dụng JWT token trong header:
```
Authorization: Bearer <token>
```

### Main Endpoints

#### Auth Routes
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh JWT
- `GET /auth/profile` - Get user profile
- `POST /auth/forgot-password` - Password reset request

#### Movie Routes
- `GET /movies` - List all movies
- `POST /movies` - Create movie (admin)
- `GET /movies/:id` - Get movie details
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie

#### Show Times Routes
- `GET /show-times` - List show times
- `POST /show-times` - Create show time
- `GET /show-times/:id` - Get show time details
- `PUT /show-times/:id` - Update show time

#### Tickets Routes
- `GET /tickets` - User's tickets
- `POST /tickets` - Book tickets
- `GET /tickets/:id` - Get ticket details
- `GET /tickets/:id/qr` - Download QR code

#### Orders Routes
- `GET /orders` - List user orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status
- `GET /orders/:id/invoice` - Get invoice

#### Combos Routes
- `GET /combos` - List combos
- `POST /combos` - Create combo (admin)
- `GET /combos/:id` - Get combo details

#### Payments Routes
- `POST /payments/vnpay/create` - Create payment
- `GET /payments/vnpay/return` - Payment callback

#### Chat Routes
- `GET /conversations` - User conversations
- `POST /conversations` - Create conversation
- `GET /conversations/:id/messages` - Get messages
- `POST /conversations/:id/messages` - Send message

#### Admin Routes
- `GET /admin/statistics` - Get statistics
- `GET /admin/reports` - Generate reports
- `GET /admin/users` - Manage users
- `GET /admin/orders` - Manage orders

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Encryption**: Bcrypt with salt rounds
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevent spam & brute force attacks
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error messages
- **Environment Variables**: Sensitive data protection

## 🚀 Performance Optimization

- **Redis Caching**: Reduce database queries
- **Connection Pooling**: Efficient DB connections
- **Pagination**: Handle large datasets
- **Async/Await**: Non-blocking operations
- **Message Queue**: Async processing with RabbitMQ
- **CDN Ready**: Cloudinary for static files

## 📊 Database Schema

### Key Tables
- **users** - User accounts & authentication
- **movies** - Movie catalog
- **show_times** - Theater schedules
- **seats** - Seat inventory
- **tickets** - Booked tickets
- **orders** - Customer orders
- **combos** - Combo bundles
- **menu_items** - Menu items
- **discounts** - Promotion codes
- **payments** - Payment records
- **events** - Special events
- **conversations** - Chat conversations
- **messages** - Chat messages
- **comments** - Movie comments
- **ratings** - User ratings

## 🔄 Redis Cache Keys Strategy

```
cache:movies:*          # Movie data
cache:show_times:*      # Show time data
cache:tickets:user:*    # User tickets
cache:user:*            # User profiles
cache:combos:*          # Combo data
```

## 📝 Environment Variables

Tất cả các biến môi trường được lưu trong tệp `.env`. Xem `.env.example` để tham khảo.

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with watch mode
npm run test:watch
```

## 📚 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^5.2.1 | Web framework |
| socket.io | ^4.8.3 | Real-time communication |
| supabase | ^2.89.0 | Database & Auth |
| redis | ^5.10.0 | Cache layer |
| amqplib | ^0.10.9 | Message queue |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT tokens |
| cloudinary | ^1.41.3 | File storage |
| nodemailer | ^7.0.12 | Email service |
| vnpay | ^2.4.4 | Payment gateway |
| zod | ^4.2.1 | Schema validation |
| xlsx | ^0.18.5 | Excel export |
| helmet | ^8.1.0 | Security headers |
| cors | ^2.8.5 | CORS handling |
| multer | ^2.0.2 | File uploads |
| qrcode | ^1.5.4 | QR generation |

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

## 📄 License

ISC License

## 📞 Support

Liên hệ qua email hoặc mở issue trên GitHub.

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 2026-03-26
