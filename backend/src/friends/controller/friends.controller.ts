import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe } from "@nestjs/common";
import { FriendService } from "../friends.service";
import { AddFriend } from "../dto/createFriends.dto";



@Controller('friend')
export class FriendController {
	constructor(private friendService: FriendService) {}

	@Post('/add')
	@HttpCode(200)
	async addNewFriend(@Body() friendData: AddFriend) {
		return await this.friendService.addNewFriend(friendData);
	}

	@Get(':id')
	findUserFriends(@Param('id') id: number) {
		return this.findUserFriends(id);
	}

	@Delete(':userID/:friendID')
	async deleteFriend(@Param('userID', ParseIntPipe) userID: number, @Param('friendID', ParseIntPipe) friendID: number): Promise<void> {
		try {
			await this.friendService.deleteFriend(userID, friendID);
		} catch (error) {
			console.log('something went wrong with removing friend. Unlucky.')
			throw (error);
		}
	}
}