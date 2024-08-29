import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UsePipes, ValidationPipe, HttpException, ParseIntPipe } from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUserData } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('user')
export class UsersController {
  constructor(private usersService: UsersService) {}
 
  @Post('/create')
  @HttpCode(200)
  @UsePipes(ValidationPipe)
  async createUser(@Body() userData: CreateUserData) {
    return await this.usersService.createNewUser(userData);
  }

  @Get('/')
  findAllUsers() {
	return this.usersService.findAllUsers();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findUser(Number(id));
    if (!user)
    	throw new HttpException('User not found', 404);
    return user;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.usersService.updateUser(+id, updateUserDto);
    return updatedUser;
  }

  @Post(':UserID/friend/:FriendID')
  async addFriend(@Param('userID') userID: number, @Param('friendID') friendID: number) {
	try {
		await this.usersService.addFriend(+userID, +friendID);
	}
	catch (error) {
		console.log('something went wrong with adding friend. Unlucky.');
		throw (error);
	}
  }

  @Get(':UserID/friends')
  async getFriends(@Param('userID', ParseIntPipe) userID: number) {
	try {
		await this.usersService.getFriends(+userID);
	}
	catch (error) {
		console.log('something went wrong with finding friends list. Unlucky.');
		throw (error);
	}
  }

  @Get(':UserID/friendedby')
  async getFriendedBy(@Param('userID', ParseIntPipe) userID: number) {
	try {
		await this.usersService.getFriendedBy(+userID);
	}
	catch (error) {
		console.log('something went wrong with finding friendedBy list. Unlucky.');
		throw (error);
	}
  }
}
