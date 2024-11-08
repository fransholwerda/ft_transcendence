import { IsNotEmpty, IsString, Matches, IsOptional, IsEnum, IsNumber, Length, isNotEmpty, matches, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDto {
    @IsNumber()
    @IsNotEmpty({ message: 'UserDto: id is empty' })
    id: number;

    @IsString()
    @Length(2, 30, { message: 'UserDto: name length not 2-30' })
    @Matches(/^[a-zA-Z0-9-]+$/, { message: 'UserDto: name is not alphanum or -' })
    @IsNotEmpty({ message: 'UserDto: name is empty' })
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'UserDto: avatarURL is empty' })
    avatarURL: string;
}

export class PongCurrentPathDto {
    @IsString()
    @IsNotEmpty({ message: 'PongGameInviteDto: currentPath is empty' })
    currentPath: string;
}

export class PongGameInviteDto {
    @IsString()
    @IsNotEmpty({ message: 'PongGameInviteDto: p1 sockid is empty' })
    player1SocketID: string;

    @IsNumber()
    @IsNotEmpty({ message: 'PongGameInviteDto: p1 id is empty' })
    player1ID: number;

    @IsString()
    @Length(2, 30, { message: 'PongGameInviteDto: p1 name length not 2-30' })
    @Matches(/^[a-zA-Z0-9-]+$/, { message: 'PongGameInviteDto: p1 name is not alphanum or -' })
    @IsNotEmpty({ message: 'PongGameInviteDto: p1 name is empty' })
    player1Username: string;

    @IsString()
    @IsNotEmpty({ message: 'PongGameInviteDto: p2 sockid is empty' })
    player2SocketID: string;

    @IsNumber()
    @IsNotEmpty({ message: 'PongGameInviteDto: p2 id is empty' })
    player2ID: number;

    @IsString()
    @Length(2, 30, { message: 'PongGameInviteDto: p2 name length not 2-30' })
    @Matches(/^[a-zA-Z0-9-]+$/, { message: 'PongGameInviteDto: p2 name is not alphanum or -' })
    @IsNotEmpty({ message: 'PongGameInviteDto: p2 name is empty' })
    player2Username: string;
    
    @IsNumber()
    @IsNotEmpty({ message: 'PongGameInviteDto: gameType is empty' })
    gameType: number;
}

export class PongJoinQueueDto {
    @IsString()
    @IsNotEmpty({ message: 'PongJoinQueueDto: gameType is empty' })
    gameMode: string;
}

export class PongMovePaddleDto {
	@IsNotEmpty({ message: 'PongMovePaddleDto: direction is empty' })
    @IsString()
	@Length(1, 1, { message: 'PongMovePaddleDto: direction not length of 1' })
	@Matches(/^(w|s)$/, { message: 'PongMovePaddleDto: direction not w or s' })
    direction: string;
}
