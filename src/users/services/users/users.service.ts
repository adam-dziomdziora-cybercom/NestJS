import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../typeorm/user.entity';
import { CreateUserDto } from '../../../users/dto/user.dtos';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  generateRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * max) + min;
  }

  generateRandomString(length: number): string {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  generateRandomUsers(numberOfUsers: number): CreateUserDto[] {
    const users: CreateUserDto[] = [];
    for (let i = 0; i < numberOfUsers; i++) {
      const userDTO = new CreateUserDto();
      userDTO.FirstName = this.generateRandomString(
        this.generateRandomNumber(1, 10),
      );
      userDTO.LastName = this.generateRandomString(
        this.generateRandomNumber(1, 10),
      );
      userDTO.CityId = this.generateRandomNumber(1, 2);
      users.push(userDTO);
    }
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    const addedUser = await this.userRepository.save(newUser);
    return addedUser;
  }

  async getUsers(): Promise<User[]> {
    const test = await this.userRepository.find();
    if (test == null || test.length < 10) {
      const randomUsers = this.generateRandomUsers(10);
      for (const randomUser of randomUsers) {
        const createdUser = await this.createUser(randomUser);
        console.log(createdUser.Id);
      }
    }

    const users = await this.userRepository.find({
      select: ['Id', 'FirstName', 'LastName', 'CityId'],
    });
    return users;
  }
}
