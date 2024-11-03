import { Controller, Post, Param, Get } from "@nestjs/common";
import { AchievementService } from "./ahievements.service";
import { UserAchievement } from "./entity/userAchievement";

@Controller('achievement')
export class AchievementController {
    constructor( private achievementsService: AchievementService) {}

    @Post(':UserID/add/:achievement')
    async addAchievement(@Param('UserID') userID: number, @Param('achievement') achievement: string) {
        try{
            await this.achievementsService.earnAchievement(+userID, achievement);
        }
        catch (Error){
            console.log("Achievement was unable to be granted");
            throw(Error);
        }
    }

    @Get(':UserID')
    async getAchievements(@Param('UserID') userID: number): Promise<UserAchievement[]> {
        try{
            return await this.achievementsService.getUserAchievements(+userID);
        }
        catch (Error){
            console.log("Achievement get request failed");
            throw(Error);
        }
    }

	@Post(':UserID/AchievementSync')
	async achievementSync(@Param('UserID') userID: number): Promise <UserAchievement[]> {
		try{
			return await this.achievementsService.assignAllAchievements(+userID);
		}
		catch (Error){
			console.log("User Achivement sync failed.");
			throw(Error);
		}
	}

}