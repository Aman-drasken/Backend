import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }


  async register(dto: RegisterDto) {
    const { firstName, lastName, email, password } = dto;

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Role.USER, 
      },
    });

    return this.generateToken(user);
  }


  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    await this.validatePassword(password, user.password);

    return this.generateToken(user);
  }


  private async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
  }


  private generateToken(user: { id: string; email: string; role: Role }) {
    const payload = {
      id: user.id,       
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}