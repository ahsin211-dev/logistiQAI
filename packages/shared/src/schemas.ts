import { z } from 'zod';
import { ShipmentPriority, ShipmentStatus, UserRole } from './types';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole),
  companyName: z.string().optional(),
});

export const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const shipmentItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  weight: z.number().positive(),
  volume: z.number().positive().optional(),
  isFragile: z.boolean().default(false),
  sku: z.string().optional(),
});

export const createShipmentSchema = z.object({
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  shipmentType: z.string().min(1),
  weight: z.number().positive(),
  volume: z.number().positive().optional(),
  priority: z.nativeEnum(ShipmentPriority).default(ShipmentPriority.NORMAL),
  scheduledPickupAt: z.string().datetime().optional(),
  scheduledDeliveryAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(shipmentItemSchema).min(1),
});

export const updateShipmentStatusSchema = z.object({
  status: z.nativeEnum(ShipmentStatus),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const locationUpdateSchema = z.object({
  shipmentId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  timestamp: z.string().datetime().optional(),
});

export const routeOptimizeSchema = z.object({
  shipmentIds: z.array(z.string().uuid()).min(1),
  vehicleId: z.string().uuid().optional(),
  considerTraffic: z.boolean().default(true),
  considerPriority: z.boolean().default(true),
});

export const autoDispatchSchema = z.object({
  shipmentId: z.string().uuid(),
  companyId: z.string().uuid().optional(),
});

export const aiChatSchema = z.object({
  message: z.string().min(1).max(2000),
  shipmentId: z.string().uuid().optional(),
  context: z.enum(['shipper', 'driver', 'admin', 'fleet']).optional(),
});

export const createVehicleSchema = z.object({
  plateNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(2030),
  capacityWeight: z.number().positive(),
  capacityVolume: z.number().positive(),
  vehicleType: z.string().min(1),
});

export const paymentCheckoutSchema = z.object({
  shipmentId: z.string().uuid(),
  amount: z.number().positive().optional(),
  currency: z.string().default('usd'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>;
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;
export type RouteOptimizeInput = z.infer<typeof routeOptimizeSchema>;
export type AutoDispatchInput = z.infer<typeof autoDispatchSchema>;
export type AiChatInput = z.infer<typeof aiChatSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type PaymentCheckoutInput = z.infer<typeof paymentCheckoutSchema>;
