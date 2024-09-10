import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';
import { FriendsModule } from 'src/friends/friends.module';
import { FriendshipRepository } from 'src/friends/friends.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FriendsModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, FriendshipRepository],
})
export class UsersModule {}
