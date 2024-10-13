import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Set up Nest
  const app = await NestFactory.create(AppModule);

  // Create Swagger options
  const config = new DocumentBuilder()
    .setTitle('Coolchain API')
    .setDescription('API Documentation for Coolchain')
    .setVersion('1.0')
    .addTag('coolchain')  // Optional: Tags for categorizing endpoints
    .build();

  // Create Swagger document and setup Swagger module
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Set the API documentation route

  // Start app
  app.enableCors();
  await app.listen(3000);
}

bootstrap();
