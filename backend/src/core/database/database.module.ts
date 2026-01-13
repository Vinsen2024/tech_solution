import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  WxUser,
  Teacher,
  Broker,
  TeacherModule,
  Share,
  VisitorBinding,
  Lead,
  ExportJob,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          WxUser,
          Teacher,
          Broker,
          TeacherModule,
          Share,
          VisitorBinding,
          Lead,
          ExportJob,
        ],
        // 首次部署时开启 synchronize 自动创建表结构
        // 生产环境稳定后建议关闭，使用 migrations
        synchronize: true,
        logging: configService.get('nodeEnv') === 'development',
        charset: 'utf8mb4',
        // 连接池配置
        extra: {
          connectionLimit: 10,
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
