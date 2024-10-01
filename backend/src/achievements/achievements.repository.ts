import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Achievement } from "./entity/achievement.entity";

@Injectable()
export class AchievementRepository extends Repository<Achievement> {
    constructor( private datasource: DataSource) {
        super (Achievement, datasource.createEntityManager());
    }
}