import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('matches')

export class Match {

	//CHANGE PLAYER 1 AND 2 TO UUIDS INSTEAD OF USERNAME STRINGS

	@PrimaryGeneratedColumn()
		id: number

	@Column({ type: 'varchar', length: 30 })
		player1: string;
	
	@Column({ type: 'int'})
		player1ID: number;

	@Column({ type: 'int'})
		player1Score: number;

	@Column({ type: 'varchar', length: 30})
		player2: string;

	@Column({ type: 'int'})
		player2ID: number;
	
	@Column({ type: 'int'})
		player2Score: number;

	@Column({ type: 'varchar'})
		winner: string;

}