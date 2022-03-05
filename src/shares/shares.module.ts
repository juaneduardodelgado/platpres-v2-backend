import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { ShareModel } from './shares.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShareModel]),
  ],
  providers: [SharesService],
  controllers: [SharesController],
  exports: [SharesService],
})
export class SharesModule {}
