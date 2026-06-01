import { Module } from '@nestjs/common';
import { PrismaModule } from './infra/prisma.module'
import { ConfigModule } from '@nestjs/config';
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
export class AppModule {}
