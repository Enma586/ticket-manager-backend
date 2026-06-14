import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaModule } from './infra/prisma/prisma.module';
import { WebsocketsModule } from './infra/websockets/websockets.module';
import {RedisModule} from './infra/redis/redis.module';
import { ConfigModule } from '@nestjs/config';
import {LoggerMiddleware} from './common/middlewares/logger.middleware'

import {UsersModule} from './modules/users/users.module'
import {AuthModule} from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal : true 
    }),
    PrismaModule,
    WebsocketsModule,
    RedisModule,

    UsersModule,
    AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
