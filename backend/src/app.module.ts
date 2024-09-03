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
import { TwostepController } from './twostep/twostep.controller';
import { MatchService } from './matches/matches.service';
// import { FriendsModule } from './friends/friends.module';

@Module({
imports: [
		ConfigModule.forRoot({
		  envFilePath: '.env',
		  
		}),
		UsersModule,
		MatchModule,
		// FriendsModule,
		TypeOrmModule.forRoot(typeOrmConfig)
	],
controllers: [AppController, AuthController, TwostepController],
  providers: [AppService, ChatGateway, PongGateway, MatchService],
})
export class AppModule {}
