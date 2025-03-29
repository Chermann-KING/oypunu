import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// import { MessagingModule } from './messaging/messaging.module';
// import { CommunitiesModule } from './communities/communities.module';
// import { LessonsModule } from './lessons/lessons.module';
import { DictionaryModule } from './dictionary/dictionary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = await Promise.resolve(
          configService.get<string>('MONGODB_URI'),
        );
        if (!uri) {
          throw new Error(
            "MONGODB_URI n'est pas définie dans les variables d'environnement",
          );
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DictionaryModule,
    // WordsModule,
    // MessagingModule,
    // CommunitiesModule,
    // LessonsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
