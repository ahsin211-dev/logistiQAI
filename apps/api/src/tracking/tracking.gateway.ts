import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/tracking' })
export class TrackingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    client.emit('connected', { message: 'Connected to tracking service' });
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(client: Socket, shipmentId: string) {
    client.join(`shipment:${shipmentId}`);
    return { event: 'subscribed', data: { shipmentId } };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, shipmentId: string) {
    client.leave(`shipment:${shipmentId}`);
    return { event: 'unsubscribed', data: { shipmentId } };
  }

  broadcastLocation(shipmentId: string, location: unknown) {
    this.server.to(`shipment:${shipmentId}`).emit('location_update', {
      shipmentId,
      location,
      timestamp: new Date().toISOString(),
    });
  }

  broadcastStatusUpdate(shipmentId: string, status: string) {
    this.server.to(`shipment:${shipmentId}`).emit('status_update', {
      shipmentId,
      status,
      timestamp: new Date().toISOString(),
    });
  }
}
