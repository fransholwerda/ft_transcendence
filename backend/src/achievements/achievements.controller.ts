import { Controller } from "@nestjs/common";
import { AchievementService } from "./ahievements.service";

@Controller('achievement')
export class AchievementController {
    constructor( private achievementsService: AchievementService) {}
}