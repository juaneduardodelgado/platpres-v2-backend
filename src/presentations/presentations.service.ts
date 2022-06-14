import { Logger, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { PresentationModel } from './presentations.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';

@Injectable()
export class PresentationsService {
    private readonly logger = new Logger(PresentationsService.name);

    constructor(
        @InjectRepository(PresentationModel)
        private presentationRepository: Repository<PresentationModel>
    ) {}

    async findAll(userId: number): Promise<PresentationModel[]> {
        return await this.presentationRepository.createQueryBuilder('presentation')
            .where('presentation.userId = :userId and presentation.state <> "deleted"', {userId}).getMany();
    }

    async findOne(id: number): Promise<PresentationModel> {
        return await this.presentationRepository.findOne(id);
    }

    async create(entity: PresentationModel): Promise<PresentationModel> {
        return await this.presentationRepository.save(entity);
    }

    async update(entity: PresentationModel): Promise<UpdateResult> {
        return await this.presentationRepository.update(entity.id, entity)
    }

    async delete(id): Promise<DeleteResult> {
        return await this.presentationRepository.delete(id);
    }
}