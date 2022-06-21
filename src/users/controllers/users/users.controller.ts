import { Controller, Get } from '@nestjs/common';
import { User } from '../../../typeorm/user.entity';
import { UsersService } from '../../../users/services/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return await this.userService.getUsers();
  }

  @Get('/new')
  async getNewUser(): Promise<User> {
    const randomUser = this.userService.generateRandomUsers(1)[0];
    return await this.userService.createUser(randomUser);
  }
}
