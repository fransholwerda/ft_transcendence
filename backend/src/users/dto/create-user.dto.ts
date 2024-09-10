import {
	IsAlphanumeric,
	IsNotEmpty,
	IsString,
	Length,
	Validate,
    Matches
} from 'class-validator';
import { IsUnique } from 'src/validation/is-unique';
import { User } from '../entities/user.entity';

export class CreateUserData {
    id: number;

    @IsString()
    @Length(2, 30, { message: 'Name must be between 3 and 30 characters' })
    @Matches(/^[a-zA-Z0-9-]+$/, { message: 'Username can only contain letters, numbers, and hyphens' })
    @Validate(IsUnique)
    @IsNotEmpty({ message: 'A name is required.' })
    username: string;

    avatarURL: string;

    isOnline: boolean;

    matchesWon: number;

    TwoFactorEnabled: boolean;

    TwoFactorSecret: string;

	friends: User[];

	friendedBy: User[];
}