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
      useFactory: (configService: ConfigService) => {
        // 打印环境变量用于调试
        console.log('========== 数据库配置调试信息 ==========');
        console.log('MYSQL_ADDRESS:', process.env.MYSQL_ADDRESS);
        console.log('MYSQL_USERNAME:', process.env.MYSQL_USERNAME);
        console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '***已设置***' : '未设置');
        console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
        console.log('DB_HOST:', process.env.DB_HOST);
        console.log('DB_PORT:', process.env.DB_PORT);
        console.log('DB_USERNAME:', process.env.DB_USERNAME);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '未设置');
        console.log('DB_DATABASE:', process.env.DB_DATABASE);
        console.log('==========================================');

        // 解析数据库配置
        const host = process.env.MYSQL_ADDRESS?.split(':')[0] || process.env.DB_HOST || 'localhost';
        const port = parseInt(process.env.MYSQL_ADDRESS?.split(':')[1] || process.env.DB_PORT || '3306', 10);
        const username = process.env.MYSQL_USERNAME || process.env.DB_USERNAME || 'root';
        const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
        const database = process.env.MYSQL_DATABASE || process.env.DB_DATABASE || 'ai_lecturer_hub';

        console.log('========== 最终数据库连接配置 ==========');
        console.log('Host:', host);
        console.log('Port:', port);
        console.log('Username:', username);
        console.log('Database:', database);
        console.log('==========================================');

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
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
          synchronize: true,
          logging: configService.get('nodeEnv') === 'development',
          charset: 'utf8mb4',
          retryAttempts: 3,
          retryDelay: 3000,
          extra: {
            connectionLimit: 10,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
