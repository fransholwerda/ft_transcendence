import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
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
    return {userData};
  }

  @Get('/')
  findAllUsers() {
    return this.usersService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.removeUser(+id);
  }
}
