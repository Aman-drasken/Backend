import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class UsersDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}