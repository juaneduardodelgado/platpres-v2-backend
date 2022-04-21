import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository, UpdateResult } from 'typeorm';
import { UserModel } from './users.entity';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(UserModel)
        private userRepository: Repository<UserModel>) {
    }
  
    async create(entity: UserModel): Promise<UserModel> {
        return await this.userRepository.save(entity);
    }

    async update(entity: UserModel): Promise<UpdateResult> {
        return await this.userRepository.update(entity.id, entity)
    }

    async findOne(username: string): Promise<UserModel | undefined> {
        const results = await this.userRepository.createQueryBuilder('user')
            .where('user.username = :username', {username}).getMany();
        if (results && results.length > 0) {
            return results[0];
        } else {
            return undefined;
        }
    }
}