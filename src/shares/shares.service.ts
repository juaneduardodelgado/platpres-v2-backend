import { Logger, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { ShareModel } from './shares.entity';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as aws from '@aws-sdk/client-ses';
import * as fs from 'fs';
import * as csv from 'csv-parser';

import { CardModel } from 'src/cards/cards.entity';
import { PresentationModel } from 'src/presentations/presentations.entity';
import { ContactModel } from 'src/contacts/contacts.entity';
import { SesEmailOptions } from '@nextnm/nestjs-ses';
import { ShareContactModel } from './shares-contact.entity';
import { ShareContactMessageModel } from './shares-contact-message.entity';
import { ConfigService } from '@nestjs/config';

let email_tmpl = '';
    
fs.readFile('./src/template.html', 'utf8', (err, data) => {
    if (err) {
        throw err;
    }
    email_tmpl = data;
});

@Injectable()
export class SharesService {
    private readonly logger = new Logger(SharesService.name);
    ses: any;
    transporter: any;

    constructor(
        @InjectRepository(ShareModel)
        private shareRepository: Repository<ShareModel>,
        @InjectRepository(ShareContactModel)
        private shareContactRepository: Repository<ShareContactModel>,
        @InjectRepository(ShareContactMessageModel)
        private shareContactMessageRepository: Repository<ShareContactMessageModel>,
        private configService: ConfigService,
    ) {
        this.ses = new aws.SES({
            apiVersion: '2010-12-01',
            region: 'us-east-1',
            credentials: {
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            }
        });

        this.transporter = nodemailer.createTransport({
            SES: { ses: this.ses, aws }
        });
    }

    async getMetrics(userId: number): Promise<any> {
        const sentCount = await this.shareContactRepository.count({
            userId,
            state: 'sent'
        });

        const rejectedCount = await this.shareContactRepository.count({
            userId,
            state: 'rejected'
        });

        const acceptedCount = await this.shareContactRepository.count({
            userId,
            state: 'accepted'
        });

        return {
            sent: sentCount,
            rejected: rejectedCount,
            accepted: acceptedCount,
        };
    }

    async findAll(userId: number): Promise<ShareModel[]> {
        return await this.shareRepository.createQueryBuilder('share')
            .where('share.userId = :userId', {userId}).getMany();
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

    async createContact(entity: ShareContactModel): Promise<ShareContactModel> {
        return await this.shareContactRepository.save(entity);
    }

    async findDeals(userId: number, status: string, shareId: number): Promise<ShareContactModel[]> {
        if (status) {
            return await this.shareContactRepository.createQueryBuilder('share_contact')
            .leftJoinAndSelect('share_contact.share', 'share')
            .leftJoinAndSelect('share_contact.contact', 'contact')
            .where('share_contact.userId = :userId and share_contact.state == :status' +
                (shareId > -1 ? ' and share_contact.shareId == :shareId' : ''),
                {userId, status, shareId})
            .getMany();
        } else {
            return await this.shareContactRepository.createQueryBuilder('share_contact')
            .leftJoinAndSelect('share_contact.share', 'share')
            .leftJoinAndSelect('share_contact.contact', 'contact')
            .where('share_contact.userId = :userId and share_contact.state != "rejected"' +
                (shareId > -1 ? ' and share_contact.shareId == :shareId' : ''),
                {userId, shareId})
            .getMany();
        }
    }

    async findReceivedDeals(email: string): Promise<ShareContactModel[]> {
        return await this.shareContactRepository.createQueryBuilder('share_contact')
        .leftJoinAndSelect('share_contact.share', 'share')
        .leftJoinAndSelect('share_contact.contact', 'contact')
        .leftJoinAndSelect('share.card', 'card')
        .where('contact.email = :email',
            {email})
            .getMany();
    }

    async findDealMessages(userId: number, id: number): Promise<ShareContactMessageModel[]> {
        return await this.shareContactMessageRepository.createQueryBuilder('record')
            .leftJoinAndSelect('record.user', 'user')
            .where('record.userId = :userId and record.shareContactId = :id', {userId, id})
            .getMany();
    }

    async findDeal(userId: number, id: number): Promise<ShareContactModel> {
        return await this.shareContactRepository.createQueryBuilder('share_contact')
            .leftJoinAndSelect('share_contact.share', 'share')
            .leftJoinAndSelect('share_contact.contact', 'contact')
            .leftJoinAndSelect('share.card', 'card')
            .leftJoinAndSelect('share.presentation', 'presentation')
            .where('share_contact.id = :id', {id, userId})
            .getOne();

        // and share_contact.userId = :userId
    }

    async findAnonymousDeal(id: number): Promise<ShareContactModel> {
        return await this.shareContactRepository.createQueryBuilder('share_contact')
            .leftJoinAndSelect('share_contact.share', 'share')
            .leftJoinAndSelect('share_contact.contact', 'contact')
            .leftJoinAndSelect('share.card', 'card')
            .leftJoinAndSelect('share.presentation', 'presentation')
            .where('share_contact.id = :id', {id})
            .getOne();
    }

    async addMessage(entity: ShareContactMessageModel): Promise<ShareContactMessageModel> {
        return await this.shareContactMessageRepository.save(entity);
    }

    parseCsv(filepath): Promise<any> {
        let contacts = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(`./uploads/${filepath}`)
                .pipe(csv())
                .on('data', (data) => {
                    contacts.push(data);
                })
                .on('end', () => {
                    resolve(contacts);
                })
                .on('error', (reason) => {
                    reject(reason);
                });
        });
        
    }

    share(share: ShareModel, card: CardModel, presentation: PresentationModel, contact: ContactModel, deal: ShareContactModel): void {
        const appUrl = this.configService.get<string>('REDIRECT_FRONT_BASE_URL');
        let htmlData = `${email_tmpl}`.replace(/%%videoUrl%%/g, card.videoGifUri)
                                      .replace(/%%logoUrl%%/g,  card.logoUri)
                                      .replace(/%%name%%/g, `${card.name} ${card.lnames}`)
                                      .replace(/%%position%%/g, card.position)
                                      .replace(/%%thumbUrl%%/g, presentation.thumbUri)
                                      .replace(/%%seeMoreUrl%%/g, `${appUrl}/presentation/${deal.id}`);

        const options: SesEmailOptions = {
            from: 'info@platpres.com',
            to: contact.email,
            subject: '::Platpres:: Te han compartido una presentación',
            html: htmlData,
            replyTo: 'noreply@platpres.com',
        };

        this.transporter.sendMail(options,
            (err, info) => {
                console.log(err || info);
            }
        );
    }
}