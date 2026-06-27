import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../config';
import { api } from './api';

let socket: Socket | null = null;

export function connectTrackingSocket(): Socket {
  if (!socket) {
    socket = io(`${WS_URL}/tracking`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function subscribeToShipment(
  shipmentId: string,
  onLocation: (data: unknown) => void,
  onStatus?: (data: unknown) => void,
) {
  const s = connectTrackingSocket();
  s.emit('subscribe', shipmentId);
  s.on('location_update', (data) => {
    if (data.shipmentId === shipmentId) onLocation(data);
  });
  if (onStatus) {
    s.on('status_update', (data) => {
      if (data.shipmentId === shipmentId) onStatus(data);
    });
  }
  return () => {
    s.emit('unsubscribe', shipmentId);
    s.off('location_update');
    if (onStatus) s.off('status_update');
  };
}

export async function sendLocationUpdate(
  shipmentId: string,
  latitude: number,
  longitude: number,
  extras?: { accuracy?: number; speed?: number; heading?: number },
) {
  return api.post('/tracking/location', {
    shipmentId,
    latitude,
    longitude,
    timestamp: new Date().toISOString(),
    ...extras,
  });
}
