import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { RedisService } from '../../infra/redis/redis.service';
import { NotificationGateway } from '../../infra/websockets/notification.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly wsGateway: NotificationGateway,
    @InjectQueue('tickets_queue') private readonly ticketsQueue: Queue,
  ) {}

  async create(createTicketDto: CreateTicketDto, userId: string, idempotencyKey?: string) {
    // 1. Control de Idempotencia
    if (idempotencyKey) {
      const cacheKey = `idempotency:ticket:${idempotencyKey}`;
      const cachedResponse = await this.redis.get(cacheKey);
      if (cachedResponse) return JSON.parse(cachedResponse);
    }

    // 2. Creación en Base de Datos
    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        creatorId: userId,
        status: 'OPEN',
        version: 1, // Asegura el inicio del bloqueo optimista
      },
    });

    // 3. Registrar Idempotencia (Expira en 24h)
    if (idempotencyKey) {
      await this.redis.set(`idempotency:ticket:${idempotencyKey}`, JSON.stringify(ticket), 'EX', 86400);
    }

    // 4. Delegar procesos pesados a BullMQ 
    // (Enviamos el title en lugar del category que no existe)
    await this.ticketsQueue.add('ticket-created-process', { 
      ticketId: ticket.id, 
      title: ticket.title 
    });

    // 5. Reactividad en Tiempo Real
    this.wsGateway.emitEvent('ticket_created', ticket);

    return ticket;
  }

  async findAll(query: QueryTicketDto) {
    const { page = 1, limit = 10, search, status, priority, assignedToId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.ticket.count({ where }),
    ]);

    return { data: tickets, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, userId: string) {
    const { expectedVersion, ...dataToUpdate } = updateTicketDto;

    // Concurrencia Optimista (Optimistic Locking)
    try {
      const updatedTicket = await this.prisma.ticket.update({
        where: { 
          id,
          // Si el frontend envía expectedVersion, forzamos la coincidencia exacta
          ...(expectedVersion && { version: expectedVersion }) 
        },
        data: {
          ...dataToUpdate,
          // Incrementamos la versión en 1 automáticamente en cada mutación
          version: { increment: 1 }, 
        },
      });

      // Emitimos el cambio al frontend para re-renderizado
      this.wsGateway.emitEvent('ticket_updated', updatedTicket);

      // Si el estado cambió, enviamos a la cola para notificaciones asíncronas
      if (dataToUpdate.status) {
        await this.ticketsQueue.add('ticket-status-changed', { 
          ticketId: id, 
          newStatus: dataToUpdate.status, 
          changedBy: userId 
        });
      }

      return updatedTicket;
    } catch (error: any) {
      // Prisma lanza P2025 si no encuentra el registro o si la versión no coincide
      if (error.code === 'P2025') {
        throw new ConflictException('El ticket fue modificado por otro usuario o no existe. Por favor, recarga y vuelve a intentarlo.');
      }
      throw error;
    }
  }
}