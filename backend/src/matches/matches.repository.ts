import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Match } from "./entity/matches.entity"



@Injectable()
export class MatchRepository extends Repository<Match> {
	constructor(private dataSource: DataSource) {
		super(Match, dataSource.createEntityManager());
	}

}