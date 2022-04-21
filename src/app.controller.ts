import { Controller, Request, Res, Post, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('api/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/logout')
  logout(@Request() req, @Res() res: Response) {
    res.clearCookie('jwt');
    res.send({
      msg: 'Successful logout',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/profile')
  async getProfile(@Request() req) {
    const user = await this.usersService.findOne(req.user.username);
    delete user.password;
    return user;
  }
}
