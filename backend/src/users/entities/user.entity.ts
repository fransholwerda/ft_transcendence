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

	@OneToMany(() => User, user => user.friends)
	friends: User[];

	@ManyToOne(() => User, friendedBy => friendedBy.id)
	friendedBy: User[];

	@OneToMany(() => User, user => user.ignores)
	ignores: User[];

	@ManyToOne(() => User, ignoredBy => ignoredBy.id)
	ignoredBy: User[];
}
