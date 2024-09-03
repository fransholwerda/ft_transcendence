import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { User } from "src/users/entities/user.entity";

@Entity()
export class Friendship{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.friends)
	friended: User;

	@ManyToOne(() => User, (user) => user.beingfriended)
	friendedBy: User;
}