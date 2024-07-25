import {
	IsAlphanumeric,
	IsNotEmpty,
	IsString,
	Length,
} from 'class-validator';

export class CreateUserData {
	@IsString()
	@Length(2, 20, {message: 'Name must be between 3 and 20 characters'})
	@IsNotEmpty({message: 'A name is required.'})
	name: string;

	@IsNotEmpty({message: 'username is required'})
	@IsAlphanumeric()
	@Length(3, 50, {message: 'username must be between 3 and 50 characters'})
	username: string;

	@IsNotEmpty()
	@Length(4, 50, { message: 'Password must consist of at least 4 characters.'})
	password: string;
}
