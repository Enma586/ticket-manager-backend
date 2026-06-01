import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool; // Guardamos el pool para poder manipularlo

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    
    // Inicializamos el Pool y lo guardamos en la clase
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.pool.query('SELECT 1');
    this.logger.log('Base de datos conectada con éxito (Prisma 7 + pg Pool)');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('Conexión a la base de datos cerrada de forma segura.');
  }
}