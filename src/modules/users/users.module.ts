import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../infra/prisma/prisma.module';
import { WebsocketsModule } from '../../infra/websockets/websockets.module';

@Module({
  imports: [PrismaModule, WebsocketsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}