import { Column, Entity, PrimaryColumn, ManyToMany, JoinTable, OneToMany, ManyToOne } from 'typeorm';

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


	@ManyToMany(() => User, user => user.friends)
	@JoinTable()
	friendedBy: User[];
	
	@ManyToMany(() => User, user => user.friendedBy)
	@JoinTable()
	friends: User[];

	@ManyToMany(() => User, user => user.ignoredUsers)
	ignoredUsers: User[];
	
	@ManyToMany(() => User, user => user.ignoredBy)
	@JoinTable()
	ignoredBy: User[];

}
