import { Module } from '@nestjs/common';
import { PresentationsService } from './presentations.service';
import { PresentationsController } from './presentations.controller';
import { PresentationModel } from './presentations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([PresentationModel]),
  ],
  providers: [PresentationsService],
  controllers: [PresentationsController],
  exports: [PresentationsService],
})
export class PresentationsModule {}
