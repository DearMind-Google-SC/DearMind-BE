import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 유효성 검사 파이프 등록
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // 데코레이터 없는 속성 제거
      forbidNonWhitelisted: true,   // 허용되지 않은 속성 있으면 에러
      transform: true,              // 요청 데이터를 DTO에 맞게 변환
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('DearMind API')
    .setDescription('인증/유저 관련 Swagger 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // http://localhost:3000/api-docs

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
