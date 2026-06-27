import { create } from 'zustand';
import { api } from '../services/api';
import { ShipmentStatus } from '@logistics/shared';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  priority: string;
  shipmentType: string;
  weight: number;
  pickupCity: string;
  pickupState: string;
  deliveryCity: string;
  deliveryState: string;
  scheduledPickupAt?: string;
  scheduledDeliveryAt?: string;
  estimatedDeliveryAt?: string;
  etaConfidence?: number;
  createdAt: string;
  items?: Array<{ description: string; quantity: number; weight: number }>;
  assignments?: Array<{
    driver?: { user?: { firstName: string; lastName: string } };
    vehicle?: { plateNumber: string };
  }>;
}

interface ShipmentState {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  isLoading: boolean;
  error: string | null;
  fetchShipments: (status?: ShipmentStatus) => Promise<void>;
  fetchShipment: (id: string) => Promise<void>;
  createShipment: (data: unknown) => Promise<Shipment>;
  updateStatus: (id: string, status: ShipmentStatus, notes?: string) => Promise<void>;
}

export const useShipmentStore = create<ShipmentState>((set) => ({
  shipments: [],
  selectedShipment: null,
  isLoading: false,
  error: null,

  fetchShipments: async (status) => {
    set({ isLoading: true, error: null });
    try {
      const query = status ? `?status=${status}` : '';
      const res = await api.get<{ data: Shipment[] }>(`/shipments${query}`);
      set({ shipments: res.data, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  fetchShipment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const shipment = await api.get<Shipment>(`/shipments/${id}`);
      set({ selectedShipment: shipment, isLoading: false });
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false });
    }
  },

  createShipment: async (data) => {
    const shipment = await api.post<Shipment>('/shipments', data);
    set((s) => ({ shipments: [shipment, ...s.shipments] }));
    return shipment;
  },

  updateStatus: async (id, status, notes) => {
    await api.patch(`/shipments/${id}/status`, { status, notes });
    set((s) => ({
      shipments: s.shipments.map((sh) => (sh.id === id ? { ...sh, status } : sh)),
      selectedShipment:
        s.selectedShipment?.id === id ? { ...s.selectedShipment, status } : s.selectedShipment,
    }));
  },
}));
