import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserData } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { QueryFailedError} from 'typeorm/error/QueryFailedError'
import { Friendship } from 'src/friends/entity/friends.entity';
import { FriendshipRepository } from 'src/friends/friends.repository';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) public userRepository: UserRepository,
	@InjectRepository(Friendship) private friendshipRepository: FriendshipRepository
	){}

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

  findUser(id: number) {
	if (this.userRepository.findOne({where: {id: id}}))
    	return this.userRepository.findOne({where: {id: id}});
	else
		throw Error;
  }

  //This function yeets and deletes a passed user from the database.
  removeUser(id: number): Promise< { affected?: number }> {
    return this.userRepository.delete(id);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
	const existingUser =  await this.findUser(id);
	const updatedUserData = this.userRepository.merge(existingUser, updateUserDto);
	return await this.userRepository.save(updatedUserData);
  }

  async addFriend(userID: number, friendID: number): Promise<void> {
	const user = await this.userRepository.findOne({where: {id: userID}});
	const friend = await this.userRepository.findOne({where: {id: friendID}});

	if (!user || !friend) {
		throw new Error ('User or friend not found');
	}

	const friendship = new Friendship();
	friendship.friendedBy = user;
	friendship.friended = friend;

	await this.friendshipRepository.save(friendship);
  }

	async removeFriend(userID: number, friendID: number) {
		const user = await this.userRepository.findOne({where: {id: userID}});
		const friend = await this.userRepository.findOne({where: {id: friendID}});

		if (!user || !friend) {
			throw new Error ('User or friend not found');
		}
	
		user.friends = user.friends.filter(user => user.id !== friendID);
		friend.beingfriended = friend.beingfriended.filter(user => user.id !== userID);

		await Promise.all([this.userRepository.save(user), this.userRepository.save(friend)]);
	}

	async getFriends(userID: number) {
		return this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.friends', 'friend')
		.where('user.id = :userID', { userID })
		.select(['friend.id', 'friend.username'])
		.getMany();
	}

	async getFriendedBy(userID: number) {
		return this.userRepository.createQueryBuilder('user')
		.leftJoinAndSelect('user.friendedBy', 'follower')
		.where('follower.id = :userID', { userID} )
		.select(['folloewr.id', 'follower.username'])
		.getMany();
	}
}
