import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Set up Nest
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Create Swagger options
  const config = new DocumentBuilder()
    .setTitle('Coolchain API')
    .setDescription('API Documentation for Coolchain')
    .setVersion('1.0')
    .build();

  // Create Swagger document and setup Swagger module
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Set the API documentation route

  // Start app
  app.enableCors({
    credentials: true,
    origin: configService.get<string>('ORIGIN'),
  });
  await app.listen(3000);
}

bootstrap();
