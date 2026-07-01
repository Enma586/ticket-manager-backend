import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TicketPriority } from '@prisma/client'; 

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(TicketPriority)
  @IsOptional() // Opcional porque en tu esquema tiene @default(MEDIUM)
  priority?: TicketPriority; 
}