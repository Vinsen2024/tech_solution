import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { PdfExportProcessor } from './pdf-export.processor';
import { CosService } from './cos.service';
import { ExportJob, Lead, Teacher, TeacherModule } from '../../core/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExportJob, Lead, Teacher, TeacherModule]),
    BullModule.registerQueue({
      name: 'export-queue',
    }),
  ],
  controllers: [ExportsController],
  providers: [ExportsService, PdfExportProcessor, CosService],
  exports: [ExportsService],
})
export class ExportsModule {}
