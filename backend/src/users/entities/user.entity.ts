import { Friendship } from 'src/friends/entity/friends.entity';
import { Column, Entity, PrimaryColumn, ManyToMany, JoinTable, ManyToOne, OneToMany } from 'typeorm';

@Entity('Users')
export class User {
	
	@PrimaryColumn()
	id: number;

	@Column({ type: 'varchar', length: 30, unique: true})
	username: string;

	@Column({ type: 'varchar'})
	avatarURL: string;

	@Column({ type: 'boolean', default: 1})
	isOnline: boolean;

	@Column({ type: 'boolean', default: 0})
	TwoFactorEnabled: boolean;

	@Column({ type: 'varchar'})
	TwoFactorSecret: string;

	@Column({ type: 'int' })
	matchesWon: number;


	@OneToMany(() => Friendship, (friendship) => friendship.friended)
	friends: Friendship[];

	@OneToMany(() => Friendship, (friendship) => friendship.friendedBy)
	beingfriended: Friendship[];


	@ManyToMany(() => User, (user) => user.ignoredUsers)
	ignoredUsers: User[];
	
	@ManyToMany(() => User, (user) => user.ignoredBy)
	ignoredBy: User[];

}
