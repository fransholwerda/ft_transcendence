import {
	IsAlphanumeric,
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';
import { IsUnique } from 'src/validation/is-unique';

export class CreateUserData {

	id: number;

	@IsString()
	@Length(2, 30, {message: 'Name must be between 3 and 30 characters'})
	@IsAlphanumeric()
	@IsUnique({ always: true, message: 'username already in use'})
	@IsNotEmpty({message: 'A name is required.'})
	username: string;

	avatarURL: string;

	isOnline: boolean;

	TwoFactorEnabled: boolean;

	TwoFactorSecret: string;
}
