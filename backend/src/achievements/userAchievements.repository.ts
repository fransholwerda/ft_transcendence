import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { UserAchievement } from "./entity/userAchievement";

@Injectable()
export class UserAcheivementRepository extends Repository<UserAchievement> {
    constructor( private datasource: DataSource) {
        super (UserAchievement, datasource.createEntityManager());
    }
}