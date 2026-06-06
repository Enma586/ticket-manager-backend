import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaModule } from './infra/prisma.module'
import { ConfigModule } from '@nestjs/config';
import {LoggerMiddleware} from './common/middlewares/logger.middleware'
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal : true 
    }),
    PrismaModule
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
