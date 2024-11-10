import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal } from 'typeorm';
import { CreateUserData } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { QueryFailedError} from 'typeorm/error/QueryFailedError'
import { Friendship } from 'src/friends/entity/friends.entity';
import { FriendshipRepository } from 'src/friends/friends.repository';
import { BlockedRepository } from 'src/ignores/ignores.repostiory';
import { Blocked } from 'src/ignores/entities/ignores.entity';
import { MatchRepository } from 'src/matches/matches.repository';

@Injectable()
export class UsersService {
	constructor(@InjectRepository(User) public userRepository: UserRepository,
	@InjectRepository(Friendship) private friendshipRepository: FriendshipRepository,
	@InjectRepository(Blocked) private blockedRepository: BlockedRepository,
	@InjectRepository(MatchRepository) private matchRepository: MatchRepository
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
	const oldName = existingUser.username;
	const updatedUserData = this.userRepository.merge(existingUser, updateUserDto);
	const newName = updatedUserData.username;
	this.updateMatchUsername(oldName, newName);
	return await this.userRepository.save(updatedUserData);
  }

  async updateMatchUsername(oldName: string, newName: string): Promise<void> {
	const matches = await this.matchRepository.createQueryBuilder('match')
	.where( 'match.player1 = :oldName OR match.player2 = :oldName', { oldName })
	.getMany();

	for (const match of matches) {
		if (match.player1 === oldName)
			match.player1 = newName;
		else
			match.player2 = newName;
		if (match.winner === oldName)
			match.winner = newName;
	}
	await this.matchRepository.save(matches);
	return;
  }

  async addFriend(userID: number, friendID: number): Promise<void> {
	const user = await this.userRepository.findOne({where: {id: userID}});
	const friend = await this.userRepository.findOne({where: {id: friendID}});

	console.log('in addFriend');
	console.log(user);
	console.log(userID);
	console.log(friend);
	console.log(friendID);
	if (!user || !friend) {
		throw new Error ('User or friend not found');
	}

	const existingFriendship = await this.friendshipRepository.findOne({
		where: { follower: user, followedUser: friend }
	});
	if (existingFriendship) {
		throw new Error('Friendship already exists');
	}

	const friendship = new Friendship();
	friendship.follower = user;
	friendship.followedUser = friend;

	await this.friendshipRepository.save(friendship);
	}

  async removeFriend(userID: number, friendID: number): Promise<void> {
		const friendship = await this.friendshipRepository.findOne({
			where: { follower: Equal(userID), followedUser: Equal(friendID) }
		});

		await this.friendshipRepository.delete(friendship.id);
	}

	async getFriends(userID: number): Promise<User[]>{
		const friendedUsers = await this.friendshipRepository.createQueryBuilder('friendship')
		.leftJoinAndSelect('friendship.followedUser', 'followedUser')
		.where('friendship.followerId = :userID', { userID })
		.getMany();

		return friendedUsers.map(entry => entry.followedUser);
	}

	async addBlocked(userID: number, toBlockID: number): Promise<void> {
		const user = await this.userRepository.findOne({where: {id: userID}});
		const blockedUser = await this.userRepository.findOne({where: {id: toBlockID}});

		if (!user || !blockedUser){
			throw new Error('User or target User not found');
		}

		const existingBlock = await this.blockedRepository.findOne({
			where: { user: user, blockedUser: blockedUser }
		});
		if (existingBlock) {
			throw new Error('User already blocked');
		}

		const blocked = new Blocked();
		blocked.user = user;
		blocked.blockedUser = blockedUser;

		await this.blockedRepository.save(blocked);
	}

	async removeBlock(userID: number, blockedID: number): Promise<void> {
		const blocked = await this.blockedRepository.findOne({
			where: { user: Equal(userID), blockedUser: Equal(blockedID)}
		})

		await this.blockedRepository.delete(blocked.id);
	}

	async checkIfBlocked(userID: number, blockedID: number): Promise<Boolean> {
		const blocked = await this.blockedRepository.findOne({
			where: { user: Equal(userID), blockedUser: Equal(blockedID)}
		})
		
		if (blocked)
			return true;
		return false;
	}

	async getBlocked(userID: number): Promise<User[]> {
		const blockedUsers = await this.blockedRepository.createQueryBuilder('blocked')
		.innerJoinAndSelect('blocked.blockedUser', 'blockedUser')
		.where('blocked.userId = :userID', { userID })
		.getMany();

		return blockedUsers.map(entry => entry.blockedUser);
	}

	async winMatch(userID: number) {
		await this.userRepository.update(userID, { matchesWon: () => 'matchesWon + 1'});
	}
}
