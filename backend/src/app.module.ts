import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import configuration from './core/config/configuration';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AttributionModule } from './modules/attribution/attribution.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { BrokersModule } from './modules/brokers/brokers.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ExportsModule } from './modules/exports/exports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // 数据库模块
    DatabaseModule,

    // BullMQ 队列模块
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password') || undefined,
        },
      }),
      inject: [ConfigService],
    }),

    // 业务模块
    AuthModule,
    AttributionModule,
    TeachersModule,
    BrokersModule,
    LeadsModule,
    ExportsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
