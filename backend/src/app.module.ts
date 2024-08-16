import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { PongGateway } from './pong/pong.gateway';
import { AuthController } from './auth/auth.controller';
import { MatchModule } from './matches/matches.module';

@Module({
imports: [
		ConfigModule.forRoot({
		  envFilePath: '.env',
		  
		}),
		UsersModule,
		MatchModule,
		TypeOrmModule.forRoot(typeOrmConfig)
	],
controllers: [AppController, AuthController],
  providers: [AppService, ChatGateway, PongGateway],
})
export class AppModule {}
