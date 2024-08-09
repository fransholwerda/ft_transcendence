import {
	IsAlphanumeric,
	IsNotEmpty,
	IsString,
	Length,
	Validate
} from 'class-validator';
import { IsUnique } from 'src/validation/is-unique';

export class CreateUserData {

	id: number;

	@IsString()
	@Length(2, 30, {message: 'Name must be between 3 and 30 characters'})
	@IsAlphanumeric()
	@Validate(IsUnique)
	@IsNotEmpty({message: 'A name is required.'})
	username: string;

	avatarURL: string;

	isOnline: boolean;

	matchesWon: number;

	TwoFactorEnabled: boolean;

	TwoFactorSecret: string;

}
