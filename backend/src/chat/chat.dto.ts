import { IsNotEmpty, IsString, Matches, IsOptional, IsEnum, IsNumber, Length } from 'class-validator';
import { ChannelType, ActionType } from './chat.enum';

export class JoinChatDto {
  userId: number;

  @IsString()
  @Length(2, 30, { message: 'Name must be between 2 and 30 characters' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
  @IsNotEmpty({ message: 'A name is required.' })
  username: string;
}

export class JoinChannelDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Channel name can only contain letters, numbers, hyphens and underscores.' })
  channel: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class LeaveChannelDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Channel name can only contain letters, numbers, hyphens and underscores.' })
  channel: string;
}

export class JoinDmDto {
  @IsString()
  @Length(2, 30, { message: 'Name must be between 2 and 30 characters' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
  @IsNotEmpty({ message: 'A name is required.' })
  targetUser: string;

  @IsString()
  @Length(2, 30, { message: 'Name must be between 2 and 30 characters' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
  @IsNotEmpty({ message: 'A name is required.' })
  user: string;
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Channel name can only contain letters, numbers, hyphens and underscores.' })
  channel: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 500, { message: 'Message must be between 1 and 500 characters.' })
  message: string;

  @IsString()
  @Length(2, 30, { message: 'Name must be between 2 and 30 characters' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
  @IsNotEmpty({ message: 'A name is required.' })
  username: string;
}

export class SetChannelTypeDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Channel name can only contain letters, numbers, hyphens and underscores.' })
  channel: string;

  @IsNotEmpty()
  @IsEnum(ChannelType, { message: 'Invalid channel type.' })
  type: ChannelType;

  @IsOptional()
  @IsString()
  password?: string;
  }

export class ChannelInviteUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Channel name can only contain letters, numbers, hyphens and underscores.' })
  channel: string;

  @IsString()
  @Length(2, 30, { message: 'Name must be between 2 and 30 characters' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
  @IsNotEmpty({ message: 'A name is required.' })
  userInvite: string;
}

export class ChannelActionUserDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Channel name can only contain letters, numbers, hyphens and underscores.' })
  channel:string;

  @IsString()
  @Length(2, 30, { message: 'Name must be between 2 and 30 characters' })
  @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
  @IsNotEmpty({ message: 'A name is required.' })
  targetUser: string;

  @IsEnum(ActionType, { message: 'Invalid action type.' })
  action: number;
}

export class UserActionDto {
  @IsNotEmpty()
  @IsString()
  targetUser: string;

  @IsNotEmpty()
  @IsEnum(ActionType, { message: 'Invalid action type.' })
  action: ActionType;
}
