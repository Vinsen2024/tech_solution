import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Teacher, TeacherModule as TeacherModuleEntity, Broker } from '../../core/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, TeacherModuleEntity, Broker])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
