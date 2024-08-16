import { Injectable } from "@nestjs/common";
import { FriendRepository } from "./friends.repository";
import { AddFriend } from "./dto/createFriends.dto";
import { Friend } from "./entity/friends.entity";


@Injectable()
export class FriendService {
	constructor ( private readonly friendRepository: FriendRepository ){}

	async addNewFriend(addFriend: AddFriend): Promise<Friend>{
		const friend: Friend = new Friend();
		friend.user = addFriend.user;
		friend.friend = addFriend.friend;
		return await this.friendRepository.save(friend);
	}

	findUserFriends(): Promise<Friend[]> {
		
	}
}