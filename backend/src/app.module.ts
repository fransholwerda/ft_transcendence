import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { ConnectionsGateway } from './connections/connections.gateway';

@Module({
imports: [
		ConfigModule.forRoot({
		  envFilePath: '.env',
		  
		}),
		DatabaseModule,
		UsersModule,
	],
controllers: [AppController],
  providers: [AppService, ChatGateway, ConnectionsGateway],
})
export class AppModule {}
