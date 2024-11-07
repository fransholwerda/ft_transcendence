import { IsNotEmpty, IsString, Matches, IsOptional, IsEnum, IsNumber, Length, isNotEmpty, matches, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    avatarURL: string;
}

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
    @IsString()
    @IsNotEmpty()
    gameMode: string;
}

export class PongMovePaddleDto {
	@IsNotEmpty()
    @IsString()
	@Length(1, 1, { message: 'Direction must be either "w" or "s".' })
	@Matches(/^(w|s)$/, { message: 'Direction must be either "w" or "s".' })
    direction: string;
}
