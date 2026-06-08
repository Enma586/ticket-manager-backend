import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    // Le pasamos la URL del .env al constructor nativo de ioredis
    super(configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  onModuleInit() {
    this.logger.log('Conectado a Redis exitosamente');
  }

  onModuleDestroy() {
    this.disconnect();
  }
}