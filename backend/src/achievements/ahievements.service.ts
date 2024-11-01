import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Achievement } from "./entity/achievement.entity";
import { UserAchievement } from "./entity/userAchievement";
import { AchievementRepository } from "./achievements.repository";
import { UserAcheivementRepository } from "./userAchievements.repository";
import { UserRepository } from "src/users/user.repository";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/entities/user.entity";


@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement) private achievementRepository: AchievementRepository,
        @InjectRepository(UserAchievement) private userAchievementRepository: UserAcheivementRepository,
        @InjectRepository(UserRepository) private userRepository: UserRepository
    ) {}

    async createAchievement(name: string): Promise<Achievement> {
        const achievement = new Achievement();
        achievement.name = name;
        return this.achievementRepository.save(achievement);
    }
    
    
    async earnAchievement(userID: number, achievementName: string): Promise<UserAchievement> {
        const userAchievement = new UserAchievement();
        userAchievement.user = await this.getUserById(userID);
        userAchievement.achievement = await this.getAchievementByName(achievementName);
        if (!userAchievement) {
            await this.createAchievement(achievementName);
            userAchievement.achievement = await this.getAchievementByName(achievementName);
        }
        return this.userAchievementRepository.save(userAchievement);
    }
    
    async assignAllAchievements(userID: number): Promise<User> {
        const friends = await this.getFriends(userID);
        if (friends.size() >= 2)
            this.earnAchievement(userID, "Look Who's Popular");
        const matches = await this.getUserById(userID);
        if (matches.matchesWon > 0)
            this.earnAchievement(userID, "A Winner is You");
        return this.
    }

    async getUserAchievements(userID: number): Promise<UserAchievement[]> {
        return this.userAchievementRepository.find({
            where: {user: {id: userID}},
            relations: ['achievement']
        })
    }
    
    private async getUserById(id:number): Promise<User> {
        return this.userRepository.findOne({where: {id: id}})
    }
    
    private async getAchievementByName(name: string): Promise<Achievement> {
        return this.achievementRepository.findOne({where: {name: name}});
    }
}
