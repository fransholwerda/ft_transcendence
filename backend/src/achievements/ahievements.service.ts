import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Achievement } from "./entity/achievement.entity";
import { UserAchievement } from "./entity/userAchievement";
import { AchievementRepository } from "./achievements.repository";
import { UserAcheivementRepository } from "./userAchievements.repository";
import { UserRepository } from "src/users/user.repository";
import { User } from "src/users/entities/user.entity";


@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement) private achievementRepository: AchievementRepository,
        @InjectRepository(UserAchievement) private userAchievementRepository: UserAcheivementRepository,
        @InjectRepository(UserRepository) private userRepository: UserRepository
    ) {}

    async createAchievement(name: string, description: string): Promise<Achievement> {
        const achievement = new Achievement();
        achievement.name = name;
        achievement.description = description;
        return this.achievementRepository.save(achievement);
    }

    async earnAchievement(userID: number, achievementName: string): Promise<UserAchievement> {
        const userAchievement = new UserAchievement();
        userAchievement.user = await this.getUserById(userID);
        userAchievement.achievement = await this.getAchievementByName(achievementName);
        return this.userAchievementRepository.save(userAchievement);

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