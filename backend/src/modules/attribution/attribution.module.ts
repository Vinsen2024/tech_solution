import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttributionController } from './attribution.controller';
import { AttributionService } from './attribution.service';
import { Share, VisitorBinding, Broker } from '../../core/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Share, VisitorBinding, Broker])],
  controllers: [AttributionController],
  providers: [AttributionService],
  exports: [AttributionService],
})
export class AttributionModule {}
