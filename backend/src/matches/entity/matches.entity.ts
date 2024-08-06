import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('matches')

export class Match {

	@PrimaryGeneratedColumn()
	id: number

	@Column({ type: 'varchar', length: 20 })
		player1: string;

	@Column({ type: 'int'})
		player1Score: number;

	@Column({ type: 'varchar', length: 20})
		player2: string;
	
	@Column({ type: 'int'})
		player2Score: number;

}