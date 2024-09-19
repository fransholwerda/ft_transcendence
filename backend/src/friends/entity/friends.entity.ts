import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';
import { User } from "src/users/entities/user.entity";

@Entity()
export class Friendship{
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => User, (user) => user.followers)
	follower: User;

	@ManyToOne(() => User, (friendedBy) => friendedBy.followedUsers)
	followedUser: User;
}