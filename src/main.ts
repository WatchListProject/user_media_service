import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'user',
      url: '0.0.0.0:5003',
      protoPath: join(__dirname, '../node_modules/protos/user_media_service.proto'),
    },
  });
  await app.listen();
}
bootstrap();
