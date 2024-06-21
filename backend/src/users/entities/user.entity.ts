import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
	//this SHOULD automatically generate IDs for the database table
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 30 })
	name: string;

	@Column({ type: 'varchar', length: 20})
	username: string;

	@Column({ type: 'varchar'})
	password:string;
}
