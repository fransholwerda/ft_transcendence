import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Achievement } from "./entity/achievement.entity";
import { UserAchievement } from "./entity/userAchievement";
import { AchievementController } from "./achievements.controller";
import { AchievementService } from "./ahievements.service";
import { AchievementRepository } from "./achievements.repository";
import { UserRepository } from "src/users/user.repository";
import { FriendshipRepository } from "src/friends/friends.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Achievement, UserAchievement])],
    controllers: [AchievementController],
    providers: [AchievementService, AchievementRepository, UserRepository, FriendshipRepository],
    exports: [TypeOrmModule, AchievementRepository, AchievementService]
})
export class AchievementModule {}
