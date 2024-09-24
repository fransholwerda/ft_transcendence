import { DataSource, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { Blocked } from "./entities/ignores.entity";

@Injectable()
export class BlockedRepository extends Repository<Blocked> {
	constructor(private dataSource: DataSource) {
		super(Blocked, dataSource.createEntityManager());
	}
}