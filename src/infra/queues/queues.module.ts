import {Module} from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq';
import {ConfigModule, ConfigService} from '@nestjs/config'

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: configService.get<number>('REDIS_PORT') || 6379,
          // Si tu Redis no tiene contraseña localmente, dejamos el undefined
          password: configService.get<string>('REDIS_PASSWORD') || undefined,
        },
        // Opciones por defecto para cualquier tarea que se envíe a cualquier cola
        defaultJobOptions: {
          attempts: 3, // Reintentar 3 veces si falla
          backoff: {
            type: 'exponential',
            delay: 1000, // Esperar 1s, luego 2s, luego 4s entre reintentos
          },
          removeOnComplete: true, // Limpiar de la memoria de Redis al terminar con éxito
          removeOnFail: false, // Mantener en Redis si falla definitivamente para poder inspeccionarlo
        },
      }),
    }),
  ],
  // Exportamos BullModule globalmente desde aquí para no repetir la conexión
  exports: [BullModule],
})
export class QueuesModule {}