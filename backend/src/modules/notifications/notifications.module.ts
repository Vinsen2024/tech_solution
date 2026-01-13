import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { NotificationsService } from './notifications.service';
import { WxUser, Teacher, Broker } from '../../core/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([WxUser, Teacher, Broker]),
    HttpModule,
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
