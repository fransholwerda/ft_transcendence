import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('Friends')
export class Friend {

	@PrimaryGeneratedColumn()
		id: number;
	
	@Column({ type: 'int'})
		user: number;
	
	@Column({ type: 'int'})
		friend: number;
}