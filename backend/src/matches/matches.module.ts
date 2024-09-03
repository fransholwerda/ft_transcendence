import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Match } from "./entity/matches.entity";
import { MatchController } from "./controllers/matches.controller";
import { MatchRepository } from "./matches.repository";
import { MatchService } from "./matches.service";

@Module({
	imports: [TypeOrmModule.forFeature([Match])],
	controllers: [MatchController],
	providers: [MatchService, MatchRepository],
	exports: [TypeOrmModule]
})
export class MatchModule{}