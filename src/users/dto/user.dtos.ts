import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(1)
  FirstName: string;

  @IsNotEmpty()
  @MinLength(1)
  LastName: string;

  CityId: number;
}
