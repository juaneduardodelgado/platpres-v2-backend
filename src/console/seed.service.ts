import { Inject } from '@nestjs/common';
import { Console, Command } from 'nestjs-console';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Console()
export class SeedService {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
  ) {}

  @Command({
    command: 'seed',
    description: 'Seed DB',
  })
  async seed(): Promise<void> {
      await this.seedUsers();
  }

  async seedUsers() {
      const pwd = 'platpres';
      const hash = await bcrypt.hash(pwd, 10);
      await this.usersService.create({ name: 'Juan Carlos Mateus', username: 'info@platpres.com', password: hash});
  }
}