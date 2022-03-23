import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CardsModule } from './cards/cards.module';
import { PresentationsModule } from './presentations/presentations.module';
import { SharesModule } from './shares/shares.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { SesModule } from '@nextnm/nestjs-ses';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConsoleModule } from 'nestjs-console';
import { SeedService } from './console/seed.service';
import { ContactsModule } from './contacts/contacts.module';

@Module({
  imports: [
    ConsoleModule,
    PostsModule,
    ContactsModule,
    CardsModule,
    PresentationsModule,
    SharesModule,
    MulterModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    SesModule.forRoot({
      AKI_KEY: 'AKIAVYXL7USELAIAZZOL',
      SECRET: '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',
      REGION: 'us-east-1',
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
