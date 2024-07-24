import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatGateway } from './chat/chat.gateway';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
imports: [
		ConfigModule.forRoot({
		  envFilePath: '.env',
		  
		}),
		UsersModule,
		TypeOrmModule.forRoot(typeOrmConfig)
	],
controllers: [AppController],
  providers: [AppService, ChatGateway],
})
export class AppModule {}
