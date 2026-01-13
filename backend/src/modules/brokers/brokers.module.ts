import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrokersController } from './brokers.controller';
import { BrokersService } from './brokers.service';
import { Share, Broker, Teacher } from '../../core/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Share, Broker, Teacher])],
  controllers: [BrokersController],
  providers: [BrokersService],
  exports: [BrokersService],
})
export class BrokersModule {}
