import { Injectable } from "@nestjs/common";
import { MatchRepository } from "./matches.repository";
import { CreateMatch } from "./dto/create-match.dto";
import { Match } from "./entity/matches.entity";

@Injectable()
export class MatchService {
	constructor ( private readonly matchRepository: MatchRepository){}

	async createNewMatch(createMatch: CreateMatch): Promise<Match>{
		const match: Match = new Match();
		match.player1 = "player1";
		match.player1Score = Math.floor(Math.random()*10) + 1;
		match.player2 = "player2";
		match.player2Score = Math.floor(Math.random()*10) + 1; 
		return await this.matchRepository.save(match);
	}

	findAllMatches(): Promise<Match[]> {
		return this.matchRepository.find();
	}

	findOne(id: number): Promise<Match> {
		return this.matchRepository.findOne({where: {id: id},});
	}

	removeMatch(id: number): Promise< { affected?: number }> {
		return this.matchRepository.delete(id);
	}
}