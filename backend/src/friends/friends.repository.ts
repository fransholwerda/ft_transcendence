import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Friendship } from "./entity/friends.entity";

@Injectable()
export class FriendshipRepository extends Repository<Friendship> {
	constructor(private dataSource: DataSource) {
		super(Friendship, dataSource.createEntityManager());
	}

}