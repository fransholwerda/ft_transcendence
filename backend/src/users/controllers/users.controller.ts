import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUserData } from '../dto/create-user.dto';

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
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
}
