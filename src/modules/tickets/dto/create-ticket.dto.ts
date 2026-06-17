import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator'

export enum TicketPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

export class CreateTicketDto {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsEnum(TicketPriority)
    priority!: TicketPriority;

    @IsString()
    @IsNotEmpty()
    category!: string
        
}