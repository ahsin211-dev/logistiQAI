-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SHIPPER', 'DRIVER', 'FLEET_MANAGER', 'TRANSPORT_COMPANY');
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'ASSIGNED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
CREATE TYPE "ShipmentPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED');
CREATE TYPE "AnomalyType" AS ENUM ('ROUTE_DEVIATION', 'DUPLICATE_INVOICE', 'UNEXPECTED_STOP', 'PAYMENT_ANOMALY', 'DRIVER_BEHAVIOR', 'SUSPICIOUS_ACTIVITY');
CREATE TYPE "NotificationType" AS ENUM ('SHIPMENT_UPDATE', 'PAYMENT', 'ASSIGNMENT', 'MAINTENANCE', 'ANOMALY', 'SYSTEM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "company_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tax_id" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT,
    "license_number" TEXT NOT NULL,
    "license_expiry" TIMESTAMP(3),
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "total_deliveries" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "current_lat" DOUBLE PRECISION,
    "current_lng" DOUBLE PRECISION,
    "last_location_at" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "plate_number" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "capacity_weight" DOUBLE PRECISION NOT NULL,
    "capacity_volume" DOUBLE PRECISION NOT NULL,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_mileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vehicle_maintenance" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "maintenance_type" TEXT NOT NULL,
    "description" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "mileage_at" DOUBLE PRECISION,
    "is_predicted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicle_maintenance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fuel_logs" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "liters" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "mileage_at" DOUBLE PRECISION NOT NULL,
    "station_name" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,
    "shipper_id" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "priority" "ShipmentPriority" NOT NULL DEFAULT 'NORMAL',
    "shipment_type" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "pickup_street" TEXT NOT NULL,
    "pickup_city" TEXT NOT NULL,
    "pickup_state" TEXT NOT NULL,
    "pickup_postal_code" TEXT NOT NULL,
    "pickup_country" TEXT NOT NULL,
    "pickup_lat" DOUBLE PRECISION,
    "pickup_lng" DOUBLE PRECISION,
    "delivery_street" TEXT NOT NULL,
    "delivery_city" TEXT NOT NULL,
    "delivery_state" TEXT NOT NULL,
    "delivery_postal_code" TEXT NOT NULL,
    "delivery_country" TEXT NOT NULL,
    "delivery_lat" DOUBLE PRECISION,
    "delivery_lng" DOUBLE PRECISION,
    "scheduled_pickup_at" TIMESTAMP(3),
    "scheduled_delivery_at" TIMESTAMP(3),
    "actual_pickup_at" TIMESTAMP(3),
    "actual_delivery_at" TIMESTAMP(3),
    "estimated_delivery_at" TIMESTAMP(3),
    "eta_confidence" DOUBLE PRECISION,
    "notes" TEXT,
    "proof_of_delivery_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipment_items" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "is_fragile" BOOLEAN NOT NULL DEFAULT false,
    "sku" TEXT,
    CONSTRAINT "shipment_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipment_documents" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "ocr_data" JSONB,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipment_status_history" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "status" "ShipmentStatus" NOT NULL,
    "notes" TEXT,
    "changed_by" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipment_locations" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "heading" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_locations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shipment_tracking_events" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shipment_tracking_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "total_distance" DOUBLE PRECISION,
    "total_duration" INTEGER,
    "polyline" TEXT,
    "is_optimized" BOOLEAN NOT NULL DEFAULT false,
    "optimization_log" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "stop_type" TEXT NOT NULL,
    "eta" TIMESTAMP(3),
    "duration" INTEGER,
    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "driver_assignments" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "vehicle_id" TEXT,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "driver_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_id" TEXT,
    "stripe_session_id" TEXT,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "pdf_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_chats" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "shipment_id" TEXT,
    "role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_ai" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_chats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_logs" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "prompt" TEXT,
    "response" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "anomaly_alerts" (
    "id" TEXT NOT NULL,
    "shipment_id" TEXT,
    "type" "AnomalyType" NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "anomaly_alerts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_value" JSONB,
    "new_value" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");
CREATE UNIQUE INDEX "shipments_tracking_number_key" ON "shipments"("tracking_number");
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE INDEX "shipment_locations_shipment_id_recorded_at_idx" ON "shipment_locations"("shipment_id", "recorded_at");
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vehicle_maintenance" ADD CONSTRAINT "vehicle_maintenance_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "shipment_items" ADD CONSTRAINT "shipment_items_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipment_documents" ADD CONSTRAINT "shipment_documents_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipment_status_history" ADD CONSTRAINT "shipment_status_history_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipment_locations" ADD CONSTRAINT "shipment_locations_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "shipment_tracking_events" ADD CONSTRAINT "shipment_tracking_events_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "routes" ADD CONSTRAINT "routes_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_chats" ADD CONSTRAINT "support_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "anomaly_alerts" ADD CONSTRAINT "anomaly_alerts_shipment_id_fkey" FOREIGN KEY ("shipment_id") REFERENCES "shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
