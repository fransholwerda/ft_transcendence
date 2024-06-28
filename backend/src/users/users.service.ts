import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	){}

	//This function should create a User in User Entity. the createUserDto paramater will create an object
	//of type createUserDto where we have already defined what we are expecting.
  createUser(createUserDto: CreateUserDto): Promise<User>{
	const user: User = new User();
	user.name = createUserDto.name;
	user.username = createUserDto.username;
	user.password = createUserDto.password;
    return this.userRepository.save(user);
  }

  // this function is used to get a list of all the users
  findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }
  //This function will update a specific user, selected by which ID is pased via parameter
  updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
	const user: User = new User();
	user.name = updateUserDto.name;
	user.username = updateUserDto.username;
	user.password = updateUserDto.password;
	user.id = id;
    return this.userRepository.save(user);
  }
  
  //This function yeets and deletes a passed user from the database.
  removeUser(id: number): Promise< { affected?: number }> {
    return this.userRepository.delete(id);
  }
}
