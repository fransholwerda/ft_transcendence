import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Achievement } from "./entity/achievement.entity";
import { UserAchievement } from "./entity/userAchievement";
import { AchievementRepository } from "./achievements.repository";
import { UserAcheivementRepository } from "./userAchievements.repository";
import { UserRepository } from "src/users/user.repository";
import { User } from "src/users/entities/user.entity";
import { FriendshipRepository } from "src/friends/friends.repository";


@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement) private achievementRepository: AchievementRepository,
        @InjectRepository(UserAchievement) private userAchievementRepository: UserAcheivementRepository,
        @InjectRepository(UserRepository) private userRepository: UserRepository,
		@InjectRepository(FriendshipRepository) private friendshipRepository: FriendshipRepository
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
        if (!userAchievement.achievement) {
			console.log("creating achievement");
            await this.createAchievement(achievementName);
            userAchievement.achievement = await this.getAchievementByName(achievementName);
        }
		// if (await this.hasAchievement(userID, achievementName) == false) {
		// 	console.log("user granted achievement: ", achievementName);
			return this.userAchievementRepository.save(userAchievement);
		// }
		// else
		// 	return;
    }
    
    async assignAllAchievements(userID: number): Promise<UserAchievement[]> {
        const user = await this.getUserById(userID);
		const friends = await this.countFriends(userID);
        if (friends >= 2)
            this.earnAchievement(userID, "Look Who's Popular");
        if (user.matchesWon > 0)
            this.earnAchievement(userID, "A Winner is You");
		const updatedAchievements = await this.getUserAchievements(userID);
        return this.userAchievementRepository.save(updatedAchievements);
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

	private async countFriends(id:number): Promise<number>{
		return await this.friendshipRepository.createQueryBuilder('friendship')
		.where('friendship.followerId = :id', { id })
		.select('friendship.followedUser')
		.getCount();
	}
    
    private async getAchievementByName(name: string): Promise<Achievement> {
        return this.achievementRepository.findOne({where: {name: name}});
    }

// 	private async hasAchievement(userID: number, achievementName: string): Promise<Boolean> {
// 		try {
// 		const user = await this.userAchievementRepository.findOne({where: { id: userID } });
// 		if (!user) {
// 			throw new Error('User not found');
// 		}

// 		const achievement = await this.achievementRepository.findOne({where: { name: achievementName}});
// 		if (!achievement) {
// 			throw new Error ('Achievement not found');
// 		}

// 		const userAchievement = await this.userRepository
// 		.createQueryBuilder('user')
// 		.leftJoinAndSelect('user.achievements', 'ua')
// 		.leftJoinAndSelect('ua.achievment', 'a')
// 		.where('user.id = :userID', {userID})
// 		.andWhere('a.name = :achievementName', {achievementName})
// 		.getOne();

// 		return !!userAchievement;
// 		} catch (error) {
// 			console.error('Error in Achievement checking:', error);
// 			throw error;
// 		}
// 	}
}
