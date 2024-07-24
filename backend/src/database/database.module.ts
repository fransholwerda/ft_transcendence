import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from "../users/entities/user.entity";

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: '0.0.0.0',
				port: 5432,
				username: 'postgres',
				password: 'postpass',
				database: 'postgres',
				synchronize: true,

				//all entites need to be represented in the database. ad stuff onto here like channels, matches, etc.
				entities: [
					User,
				]
			}),
		}),
	],
})
export class DatabaseModule {}
