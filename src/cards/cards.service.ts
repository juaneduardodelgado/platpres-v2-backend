import { Logger, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CardModel } from './cards.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';

@Injectable()
export class CardsService {
    private readonly logger = new Logger(CardsService.name);

    constructor(
        @InjectRepository(CardModel)
        private cardRepository: Repository<CardModel>
    ) {}

    async findAll(): Promise<CardModel[]> {
        return await this.cardRepository.find();
    }

    async findOne(id: number): Promise<CardModel> {
        return await this.cardRepository.findOne(id);
    }

    async create(entity: CardModel): Promise<CardModel> {
        return await this.cardRepository.save(entity);
    }

    async update(entity: CardModel): Promise<UpdateResult> {
        return await this.cardRepository.update(entity.id, entity)
    }

    async delete(id): Promise<DeleteResult> {
        return await this.cardRepository.delete(id);
    }
}