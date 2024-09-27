import { IsNotEmpty, IsString, Matches, IsOptional, IsEnum, IsNumber, Length } from 'class-validator';
import { User } from 'pong/types';

export class PongCurrentPathDto {
	currentPath: string;
}

export class PongGameInviteDto {
	player1SocketID: string;
	player1ID: number;
	player1Username: string;
	player2SocketID: string;
	player2ID: number;
	player2Username: string;
	gameType: number;
}

export class PongJoinQueueDto {
	user: User;
	gameMode: string;
}

export class PongMovePaddleDto {
	direction: string
}
