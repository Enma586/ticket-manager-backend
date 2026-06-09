import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// cors: { origin: '*' } permite que cualquier frontend se conecte (por ahora)
@WebSocketGateway({ cors: { origin: '*' } }) 
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Este método público lo usarán tus servicios (ej. TicketsService) 
  // para gritarle al frontend que algo cambió
  emitEvent(event: string, data: any) {
    this.server.emit(event, data);
  }
}