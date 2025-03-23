import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';
// import { WordsModule } from './words/words.module';
// import { MessagingModule } from './messaging/messaging.module';
// import { CommunitiesModule } from './communities/communities.module';
// import { LessonsModule } from './lessons/lessons.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: await Promise.resolve(configService.get<string>('MONGODB_URI')),
      }),
      inject: [ConfigService],
    }),
    // AuthModule,
    // UsersModule,
    // WordsModule,
    // MessagingModule,
    // CommunitiesModule,
    // LessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
