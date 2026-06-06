import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe} from '@nestjs/common';  
import { HttpExeptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor'; 
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
async function bootstrap() {

  process.env.TZ = 'UTC';
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new TransformInterceptor(), new TimeoutInterceptor());
 
  app.useGlobalFilters(new HttpExeptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions : {
        enableImplicitConversion: true
      }
    })
  )  
  await app.listen(process.env.PORT ?? 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
