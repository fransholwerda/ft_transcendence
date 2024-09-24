import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Blocked } from "./entities/ignores.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Blocked])],
	controllers: [],
	providers: [],
	exports: [TypeOrmModule]
})
export class BlockedModule{}