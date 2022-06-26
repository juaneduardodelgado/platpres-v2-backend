import { Controller, Request, Res, Post, UseGuards, Get, HttpCode, HttpStatus, Body, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersService } from './users/users.service';
import { UserModel } from './users/users.entity';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @UseGuards(LocalAuthGuard)
  @Post('api/login')
  async login(@Request() req) {
    const found = await this.usersService.findOne(req.user.username);

    if (found && found.activated !== true) {
      throw new HttpException({
        message: 'User not activated yet',
        errorCode: 11
      }, HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(req.user);
  }

  @Post('api/register')
  async register(@Request() req, @Body() user: UserModel) {
    const found = await this.usersService.findOne(user.username);

    if (found) {
      throw new HttpException({
        message: 'User already registered',
        errorCode: 15
      }, HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.usersService.create(user);
    await this.usersService.sendActivationEmail(newUser);
    return {
      username: newUser.username,
      uuid: newUser.uuid,
      name: newUser.name,
      lastname: newUser.lastname,
    };
  }

  @Post('api/recover')
  async recover(@Request() req, @Body() data: any) {
    const user = await this.usersService.findOne(data.email);

    if (!user) {
      return {
        message: 'success',
      };
    }

    await this.usersService.generateNewActivationCode(user);
    await this.usersService.sendRecoverEmail(user);

    return {
      message: 'success',
    };
  }

  @Post('api/setpwd')
  async setpwd(@Request() req, @Body() data: any) {
    const activationCode = data.ac;
    const password = data.password;
    const user = await this.usersService.findOnebyActivationCode(activationCode);

    if (!activationCode || !user) {
      throw new HttpException({
        message: 'Not valid code',
        errorCode: 12
      }, HttpStatus.BAD_REQUEST);
    }

    user.password = password;
    await this.usersService.setpwd(user);
    return this.authService.login(user);
  }

  @Post('api/activate')
  async activate(@Request() req, @Body() data: any) {
    const activationCode = data.ac;
    const user = await this.usersService.findOnebyActivationCode(activationCode);

    if (!activationCode || !user) {
      throw new HttpException({
        message: 'Not valid code',
        errorCode: 12
      }, HttpStatus.BAD_REQUEST);
    }

    user.activated = true;
    await this.usersService.update(user);
    return this.authService.login(user);
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
