import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";


@Module({
	imports: [TypeOrmModule.forFeature([Friend])],
	controllers: [FriendController],
	providers: [FriendService, FriendRepository],
})
export class FriendsModule{}