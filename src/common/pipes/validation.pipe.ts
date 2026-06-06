import {ValidationPipe, ValidationError, BadRequestException, Injectable} from '@nestjs/common'

@Injectable()
export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, 
      forbidNonWhitelisted: true, 
      transform: true, 
      transformOptions: {
        enableImplicitConversion: true, 
      },

      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error) => {
          return {
            field: error.property,
            errors: Object.values(error.constraints || {}),
          };
        });
        
        return new BadRequestException({
          message: 'Error de validación en los datos enviados',
          details: formattedErrors,
        });
      },
    });
  }
}