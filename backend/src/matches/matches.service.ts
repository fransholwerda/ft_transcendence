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
		.where('(matches.player1ID = :playerID OR matches.player2ID = :playerID)', { playerID }).getMany();

		console.log(playerMatches);
		console.log("hello this is a test");

		return playerMatches;
	}

	async getUserRankings(): Promise<{ id: number, matchesWon: number }[]> {
		const matches = await this.matchRepository.find();
		const userWins = new Map<number, { id: number, matchesWon: number }>();
	
		matches.forEach(match => {
			if (!userWins.has(match.player1ID)) {
				userWins.set(match.player1ID, { id: match.player1ID, matchesWon: 0 });
			}
			if (!userWins.has(match.player2ID)) {
				userWins.set(match.player2ID, { id: match.player2ID, matchesWon: 0 });
			}
			if (match.winner === match.player1) {
				userWins.get(match.player1ID).matchesWon++;
			} else if (match.winner === match.player2) {
				userWins.get(match.player2ID).matchesWon++;
			}
		});
		return Array.from(userWins.values()).sort((a, b) => b.matchesWon - a.matchesWon);
	}
	
	async getUserRanking(id: number): Promise<number> {
		const rankings = await this.getUserRankings();
		const userRank = rankings.findIndex(r => r.id === id);
		return userRank + 1;
	}
}
