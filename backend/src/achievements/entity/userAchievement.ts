import { User } from "src/users/entities/user.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Achievement } from "./achievement.entity";

@Entity()
export class UserAchievement {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Achievement)
    achievement: Achievement;
}