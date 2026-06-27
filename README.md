# Logistics Platform

Production-ready AI-powered logistics mobile platform connecting shippers, transport companies, fleet managers, drivers, and admins.

## Architecture

```
logistics-platform/
├── apps/
│   ├── api/          # NestJS backend API
│   └── mobile/       # React Native (Expo) mobile app
├── packages/
│   └── shared/       # Shared TypeScript types & Zod schemas
├── docker/           # Docker Compose (PostgreSQL, Redis)
└── .github/          # CI/CD workflows
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo, TypeScript, NativeWind |
| Navigation | Expo Router, React Navigation |
| State | Zustand |
| Backend | NestJS, Prisma, PostgreSQL |
| Realtime | Socket.io WebSockets |
| Auth | JWT, bcrypt, role-based guards |
| AI | OpenAI API (prompts in `apps/api/src/ai/prompts/`) |
| Payments | Stripe |
| Maps | react-native-maps, Google Maps API |
| Validation | Zod (shared), class-validator (API) |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- (Optional) OpenAI API key, Stripe keys, Google Maps API key

### 1. Start infrastructure

```bash
cp .env.example .env
npm run docker:up
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup database

```bash
npm run db:generate
cd apps/api && npx prisma migrate dev --name init
npm run db:seed
```

### 4. Start API

```bash
npm run api:dev
```

API: http://localhost:3000/api/v1  
Swagger: http://localhost:3000/api/docs

### 5. Start mobile app

```bash
npm run mobile:start
```

Use Expo Go on iOS/Android or run `npm run mobile:ios` / `npm run mobile:android`.

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@logistics.com | Password123! |
| Shipper | shipper@example.com | Password123! |
| Fleet Manager | fleet@acmelogistics.com | Password123! |
| Driver | driver@acmelogistics.com | Password123! |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login |
| GET | `/users/me` | Current user profile |
| POST | `/shipments` | Create shipment |
| GET | `/shipments` | List shipments (role-filtered) |
| GET | `/shipments/:id` | Shipment detail |
| PATCH | `/shipments/:id/status` | Update status |
| POST | `/shipments/:id/documents` | Upload document |
| POST | `/shipments/:id/proof-of-delivery` | Upload POD |
| POST | `/tracking/location` | GPS location update |
| GET | `/tracking/:shipmentId` | Tracking data |
| POST | `/routes/optimize` | AI route optimization |
| POST | `/dispatch/auto-assign` | AI dispatch |
| POST | `/documents/process` | OCR document processing |
| POST | `/ai/chat` | AI chat assistant |
| GET | `/fleet/vehicles` | List vehicles |
| POST | `/fleet/vehicles` | Create vehicle |
| POST | `/payments/checkout` | Stripe checkout |
| GET | `/admin/analytics` | Admin dashboard |

## User Roles & Permissions

- **Admin**: Full access to all data and analytics
- **Shipper**: Own shipments only
- **Driver**: Assigned shipments only, GPS updates, POD upload
- **Fleet Manager**: Company fleet, drivers, assignments
- **Transport Company**: Company-level operations

## AI Features

All AI services use real database context and never invent statuses, prices, ETAs, or locations:

1. Route optimization
2. ETA prediction with confidence scores
3. Load optimization
4. Auto-dispatch assistant
5. Demand forecasting
6. Chat assistant (database-grounded)
7. Document OCR processing
8. Fraud & anomaly detection
9. Predictive maintenance

Prompts are isolated in `apps/api/src/ai/prompts/index.ts`.

## Mobile Screens

- Splash, Login, Register, Role Selection
- Shipper Dashboard, Create Shipment, Shipment Detail
- Live Tracking, Payment/Invoice
- Driver Dashboard, Active Trip, Proof of Delivery
- Fleet Manager Dashboard, Vehicle/Driver Management
- Notifications, AI Assistant Chat, Profile/Settings

## Environment Variables

See `.env.example` for all configuration options.

## Docker Deployment

```bash
docker build -f apps/api/Dockerfile -t logistics-api .
docker run -p 3000:3000 --env-file .env logistics-api
```

## Security

- JWT authentication with global guard
- Role-based access control on all endpoints
- Audit logging for sensitive operations
- Shipment status transition validation
- Timestamped GPS updates
- Secure proof of delivery storage

## License

Proprietary
