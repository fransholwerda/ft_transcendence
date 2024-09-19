import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UserRepository } from './user.repository';
import { UsersService } from './users.service';
import { FriendsModule } from 'src/friends/friends.module';
import { FriendshipRepository } from 'src/friends/friends.repository';
import { BlockedRepository } from 'src/ignores/ignores.repostiory';
import { BlockedModule } from 'src/ignores/ignores.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), FriendsModule, BlockedModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, FriendshipRepository, BlockedRepository],
})
export class UsersModule {}
