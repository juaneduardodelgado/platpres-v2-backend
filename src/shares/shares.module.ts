import { Module } from '@nestjs/common';
import { SharesService } from './shares.service';
import { SharesController } from './shares.controller';
import { ShareModel } from './shares.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SesModule } from '@nextnm/nestjs-ses';
import { CardsModule } from 'src/cards/cards.module';
import { PresentationsModule } from 'src/presentations/presentations.module';
import { ContactsModule } from 'src/contacts/contacts.module';
import { ShareContactModel } from './shares-contact.entity';
import { ShareContactMessageModel } from './shares-contact-message.entity';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule,
    CardsModule,
    PresentationsModule,
    ContactsModule,
    UsersModule,
    TypeOrmModule.forFeature([ShareModel, ShareContactModel, ShareContactMessageModel]),
    SesModule.forRoot({
      SECRET: 'AKIAVYXL7USELAIAZZOL',
      AKI_KEY: 'xZ0rS7nNqqiPTBSK/wpQIHqggL/S4SfGHfaiexre',
      REGION: 'us-east-1',
    }),
  ],
  providers: [SharesService],
  controllers: [SharesController],
  exports: [SharesService],
})
export class SharesModule {}
