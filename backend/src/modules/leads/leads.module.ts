import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { LeadsController, TeacherLeadsController, BrokerLeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LlmService } from './llm.service';
import { Lead, TeacherModule, WxUser, Teacher, Broker } from '../../core/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, TeacherModule, WxUser, Teacher, Broker]),
    HttpModule,
  ],
  controllers: [LeadsController, TeacherLeadsController, BrokerLeadsController],
  providers: [LeadsService, LlmService],
  exports: [LeadsService],
})
export class LeadsModule {}
