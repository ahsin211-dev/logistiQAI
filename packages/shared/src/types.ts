export enum UserRole {
  ADMIN = 'ADMIN',
  SHIPPER = 'SHIPPER',
  DRIVER = 'DRIVER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  TRANSPORT_COMPANY = 'TRANSPORT_COMPANY',
}

export enum ShipmentStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ShipmentPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum AnomalyType {
  ROUTE_DEVIATION = 'ROUTE_DEVIATION',
  DUPLICATE_INVOICE = 'DUPLICATE_INVOICE',
  UNEXPECTED_STOP = 'UNEXPECTED_STOP',
  PAYMENT_ANOMALY = 'PAYMENT_ANOMALY',
  DRIVER_BEHAVIOR = 'DRIVER_BEHAVIOR',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export enum NotificationType {
  SHIPMENT_UPDATE = 'SHIPMENT_UPDATE',
  PAYMENT = 'PAYMENT',
  ASSIGNMENT = 'ASSIGNMENT',
  MAINTENANCE = 'MAINTENANCE',
  ANOMALY = 'ANOMALY',
  SYSTEM = 'SYSTEM',
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export * from './schemas';
