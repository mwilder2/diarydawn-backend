import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CustomLoggerService } from './common/services/custom-logger.service';
import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout/timeout.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  let app;
  const customLogger = new CustomLoggerService();

  try {
    app = await NestFactory.create(AppModule, {
      logger: customLogger,
    });

    const configService = app.get(ConfigService);

    app.useGlobalPipes(new ValidationPipe());

    app.enableCors({
      origin: true,
      allowedHeaders: 'Authorization, Content-Type, Accept, X-Requested-With, X-HTTP-Method-Override, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Allow-Methods',
      methods: "GET, PUT, POST, DELETE, UPDATE, OPTIONS",
      credentials: true,  // For requests that include credentials like cookies, authorization headers or TLS client certificates.
    });

    app.useGlobalFilters(new HttpExceptionFilter(customLogger));
    app.useGlobalInterceptors(new TimeoutInterceptor(customLogger));

    const options = new DocumentBuilder()
      .setTitle('Dawn API')
      .setDescription('Dawn API Is the Nest.js backend of Diary Dawn')
      .setVersion('1.0')
      .addBearerAuth() // This enables JWT token input in Swagger UI
      .addTag('dawn')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    const port = configService.get('PORT') || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Server started on port ${port}`);
  } catch (error) {
    customLogger.error('Failed to bootstrap the application', error.stack);
    process.exit(1);
  }
}

bootstrap();