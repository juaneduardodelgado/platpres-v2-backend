import { Logger, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ShareModel } from './shares.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';

@Injectable()
export class SharesService {
    private readonly logger = new Logger(SharesService.name);

    constructor(
        @InjectRepository(ShareModel)
        private shareRepository: Repository<ShareModel>
    ) {}

    async findAll(): Promise<ShareModel[]> {
        return await this.shareRepository.find();
    }

    async findOne(id: number): Promise<ShareModel> {
        return await this.shareRepository.findOne(id);
    }

    async create(entity: ShareModel): Promise<ShareModel> {
        return await this.shareRepository.save(entity);
    }

    async update(entity: ShareModel): Promise<UpdateResult> {
        return await this.shareRepository.update(entity.id, entity)
    }

    async delete(id): Promise<DeleteResult> {
        return await this.shareRepository.delete(id);
    }
}