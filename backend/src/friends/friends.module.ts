import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Friendship } from "./entity/friends.entity";
import { FriendshipRepository } from "./friends.repository";

@Module({
	imports: [TypeOrmModule.forFeature([Friendship])],
	controllers: [],
	providers: [FriendshipRepository],
	exports: [TypeOrmModule, FriendshipRepository]
})
export class FriendsModule{}