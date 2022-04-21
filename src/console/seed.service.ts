import { Inject } from '@nestjs/common';
import { Console, Command } from 'nestjs-console';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid-int';

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
      const generator = uuid(1);
      const _uuid = generator.uuid();
      
      const hash = await bcrypt.hash(pwd, 10);
      await this.usersService.create({
        name: 'Juan Carlos Mateus',
        username: 'info@platpres.com',
        password: hash,
        uuid: _uuid.toString(),
      });
  }
}