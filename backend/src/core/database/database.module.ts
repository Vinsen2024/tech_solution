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
        synchronize: configService.get('nodeEnv') === 'development', // 生产环境应设为false
        logging: configService.get('nodeEnv') === 'development',
        charset: 'utf8mb4',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
