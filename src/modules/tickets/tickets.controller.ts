import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { QueryTicketDto } from './dto/query-ticket.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() user: any,
    @Headers('x-idempotency-key') idempotencyKey?: string,
  ) {
    return this.ticketsService.create(createTicketDto, user.id, idempotencyKey);
  }

  @Get()
  findAll(@Query() query: QueryTicketDto) {
    return this.ticketsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketsService.update(id, updateTicketDto, user.id);
  }
}