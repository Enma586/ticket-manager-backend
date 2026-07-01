import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsEnum, IsOptional, IsInt, IsString } from 'class-validator';
// 1. Importamos el estado directamente de Prisma
import { TicketStatus } from '@prisma/client'; 

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  // 2. Aplicamos el tipo oficial
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsString()
  @IsOptional()
  assignedToId?: string;

  @IsInt()
  @IsOptional()
  expectedVersion?: number; 
}