import { IsNotEmpty, IsString, Matches, IsOptional, IsEnum, IsNumber, Length, isNotEmpty, matches, IsObject } from 'class-validator';
import { User } from './pong.types';

// Classes implementing interfaces
export class PongCurrentPathDto {
    @IsString()
    currentPath: string;
}

export class PongGameInviteDto {
    @IsString()
    player1SocketID: string;

    @IsNumber()
    player1ID: number;

    @IsString()
    player1Username: string;

    @IsString()
    player2SocketID: string;

    @IsNumber()
    player2ID: number;

    @IsString()
    player2Username: string;

    @IsNumber()
    gameType: number;
}

export class PongJoinQueueDto {
	@IsObject()
    @IsNotEmpty()
    user: User;

    @IsString()
    gameMode: string;
}

export class PongMovePaddleDto {
	@IsNotEmpty()
    @IsString()
	@Length(2, 4, { message: 'Direction must be either "up" or "down".' })
	@Matches(/^(up|down)$/, { message: 'Direction must be either "up" or "down".' })
    direction: string;
}
