import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { registerWithConsul } from './consul-registration';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    const config = new DocumentBuilder()
        .setTitle('Accommodation Service API')
        .setDescription('Rooms, beds, buildings, students, and bed allocations.')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4001;
    await app.listen(port);
    registerWithConsul('accommodation', port);
}
bootstrap();