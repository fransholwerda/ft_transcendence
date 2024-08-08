import { Injectable } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { User } from "src/users/entities/user.entity";

@ValidatorConstraint({ name: 'IsUnique', async: true})
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
	constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

	async validate(username: any, args: ValidationArguments) {
		const user = await this.userRepository.findOne(username);
		if (user) return false;
		return true;
	}
}

export function IsUnique(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'IsUnique',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsUniqueConstraint,
		});
	};
}