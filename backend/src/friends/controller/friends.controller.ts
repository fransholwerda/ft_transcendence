import { Controller } from "@nestjs/common";
import { FriendService } from "../friends.service";
import { AddFriend } from "../dto/createFriends.dto";



@Controller('friend')
export class FriendController {
	constructor(private friendService: FriendService)
}