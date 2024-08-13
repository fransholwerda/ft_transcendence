import { Controller, Post, Body, Delete, Get, Param, HttpCode } from "@nestjs/common";
import { MatchService } from "../matches.service";
import { CreateMatch } from "../dto/create-match.dto";


@Controller('match')
export class MatchController {
	constructor(private matchService: MatchService) {}

	@Post('/create')
	@HttpCode(200)
	async createMatch(@Body() matchData: CreateMatch) {
		return await this.matchService.createNewMatch(matchData);
	}
	
	@Get ('/')
	findAllMatches() {
		return this.matchService.findAllMatches();
	}

	@Get(':id')
	findOne(@Param('id') id:string) {
		return this.matchService.findOne(+id);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.matchService.removeMatch(+id);
	}
}