// import { Injectable } from "@nestjs/common";
// import { DataSource } from "typeorm";
// import { FriendRepository } from "./friends.repository";
// import { UserRepository } from "src/users/user.repository";
// import { AddFriend } from "./dto/createFriends.dto";
// import { Friend } from "./entity/friends.entity";


// @Injectable()
// export class FriendService {
// 	constructor ( private readonly friendRepository: FriendRepository ){}

// 	async addNewFriend(addFriend: AddFriend): Promise<Friend>{
// 		const userRepository = dataSource.getRepository(User);

// 		friend.user = addFriend.user;
// 		friend.friend = addFriend.friend;
// 		return await this.friendRepository.save(friend);
// 	}

// 	findUserFriends(userID: number): Promise<Friend[]> {
// 		return this.friendRepository.find({where: {user: userID}});
// 	}

// 	async deleteFriend(userID: number, friendID: number): Promise<void> {
// 		try {
// 			const queryBuilder = this.friendRepository.createQueryBuilder();

// 			await queryBuilder
// 				.delete()
// 				.from(Friend)
// 				.where("user = :userID AND friend = :friendID", { userID, friendID })
// 				.execute();
			
// 			console.log('friend link between ${userID} and ${friendID} removed.');
// 		} catch (error) {
// 			console.log('friend link removal between ${userID} and ${friendID} failed.');
// 			throw error;
// 		}
// 	}
// }