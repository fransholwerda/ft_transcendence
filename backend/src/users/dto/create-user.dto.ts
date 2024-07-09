import {
	IsAlphanumeric,
	IsNotEmpty,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsString()
	@MinLength(2, { message: 'Your name is too short bro.'})
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	@MinLength(3, { message: 'Username should be at least 3 characters long.'})
	@IsAlphanumeric(null, { message: 'Username must consist out of alphanumeric characters only.'})
	username: string;

	@IsNotEmpty()
	@MinLength(4, { message: 'Password must consist of at least 4 characters.'})
	password: string;
}
