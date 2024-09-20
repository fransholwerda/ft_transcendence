import { Injectable } from "@nestjs/common";
import { MatchRepository } from "./matches.repository";
import { CreateMatch } from "./dto/create-match.dto";
import { Match } from "./entity/matches.entity";

@Injectable()
export class MatchService {
	constructor ( private readonly matchRepository: MatchRepository){}

	async createNewMatch(createMatch: CreateMatch): Promise<Match>{
		const match: Match = new Match();
		match.player1 = createMatch.player1;
		match.player1ID = createMatch.player1ID;
		match.player1Score = createMatch.player1Score;
		match.player2 = createMatch.player2;
		match.player2ID = createMatch.player2ID;
		match.player2Score = createMatch.player2Score;
		match.winner = createMatch.winner;
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

	async findPlayersMatches(playerID: number): Promise<Match[]> {
		const playerMatches = this.matchRepository.createQueryBuilder('matches')
		.where('(matches.player1ID = :playerID OR matches.player2ID = :playerID)', { playerID });

		console.log(playerMatches.getMany());
		console.log("hello this is a test");

		return playerMatches.getMany();
	}
}