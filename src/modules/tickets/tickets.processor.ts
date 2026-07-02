import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Processor('tickets_queue')
export class TicketsProcessor extends WorkerHost {
  private readonly logger = new Logger(TicketsProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Procesando tarea de cola [${job.name}] con ID: ${job.id}`);

    switch (job.name) {
      case 'ticket-created-process':
        await this.handleTicketCreated(job.data);
        break;
      case 'ticket-status-changed':
        await this.handleStatusChanged(job.data);
        break;
      default:
        this.logger.warn(`No existe un manejador para la tarea: ${job.name}`);
    }
  }

  private async handleTicketCreated(data: { ticketId: string; title: string }) {
    // Aquí recibimos el title correcto desde el service
    this.logger.log(`Lógica asíncrona iniciada para el ticket: ${data.title} (${data.ticketId})`);
    
    // Aquí implementaremos más adelante la lectura de SystemConfig
    // para la asignación automática o el envío de correos.
  }

  private async handleStatusChanged(data: { ticketId: string; newStatus: string; changedBy: string }) {
    this.logger.log(`Notificación de cambio de estado a ${data.newStatus} procesada para el ticket: ${data.ticketId}`);
  }
}