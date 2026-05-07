import {
Controller,
Post,
Body,
Get,
UseGuards,
Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../comman/guards/jwt-auth.guard';
import { Public } from '../comman/decorators/public.decorator';

@Controller('auth')
export class AuthController {
constructor(private readonly authService: AuthService) {}


@Public()
@Post('register')
async register(@Body() dto: RegisterDto) {
return this.authService.register(dto);
}


@Public()
@Post('login')
async login(@Body() dto: LoginDto) {
return this.authService.login(dto);
}


@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
return req.user;
}
}
