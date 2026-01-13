import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 启用CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  // 优先使用环境变量 PORT（微信云托管会设置这个变量）
  const port = process.env.PORT || configService.get('port') || 3000;

  // 监听所有网络接口
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on port ${port}`);
}

bootstrap();
