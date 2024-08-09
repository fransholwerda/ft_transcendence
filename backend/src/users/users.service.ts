import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserData } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { QueryFailedError} from 'typeorm/error/QueryFailedError'

@Injectable()
export class UsersService {
	constructor( private readonly userRepository: UserRepository){}

	//This function should create a User in User Entity. the createUserData paramater will create an object
	//of type createUserData where we have already defined what we are expecting.
  async createNewUser(createUserData: CreateUserData): Promise<User>{
	try {
		const user: User = new User();
		user.id = createUserData.id
		user.username = createUserData.username;
		user.avatarURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png'
		user.isOnline = true;
		user.TwoFactorEnabled = false;
		user.TwoFactorSecret = '';
		user.matchesWon = 0;
		return await this.userRepository.save(user);
	} catch (error) {
		if (error instanceof QueryFailedError && error.driverError.code === '23505') {
			console.log('that username is already in use');
			throw new HttpException('Username already in use', HttpStatus.FORBIDDEN);
		} else {
			throw error;
		}
	}
  }

  // this function is used to get a list of all the users
  findAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  //This function yeets and deletes a passed user from the database.
  removeUser(id: number): Promise< { affected?: number }> {
    return this.userRepository.delete(id);
  }
}
