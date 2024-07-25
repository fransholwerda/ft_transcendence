import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserData } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserRepository) private userRepository: UserRepository,
	){}

	//This function should create a User in User Entity. the createUserData paramater will create an object
	//of type createUserData where we have already defined what we are expecting.
  async createNewUser(createUserData: CreateUserData): Promise<User>{
	const user: User = new User();
	user.name = createUserData.name;
	user.username = createUserData.username;
	user.password = createUserData.password;
    return await this.userRepository.save(user);
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
