import { User } from "src/users/entities/user.entity";
import { PrimaryGeneratedColumn, ManyToOne, Entity } from 'typeorm';

@Entity()
export class Blocked{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user => user.blocks))
	blocked: User;

	@ManyToOne(() => User, (user => user.blocks))
	blockedBy: User;
}