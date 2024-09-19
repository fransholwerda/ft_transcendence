import { Friendship } from 'src/friends/entity/friends.entity';
import { Blocked } from 'src/ignores/ignores.entity.ts/ignores.entity';
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


	@OneToMany(() => Friendship, (friendship) => friendship.follower)
	followers: Friendship[];

	@OneToMany(() => Friendship, (friendship) => friendship.follower)
	followedUsers: Friendship[];


	@OneToMany(() => Blocked, (blocked) => blocked.user)
	blocks: Blocked[];
	
	@OneToMany(() => Blocked, (blocked) => blocked.blockedUser)
	blockedBy: Blocked[];
}
