import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Patch, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import *  as path from 'path';
import * as multer from 'multer';
import { ShareModel } from './shares.entity';
import { SharesService } from './shares.service';
import { SesEmailOptions, SesService } from '@nextnm/nestjs-ses';
import { CardsService } from 'src/cards/cards.service';
import { PresentationsService } from 'src/presentations/presentations.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ContactModel } from 'src/contacts/contacts.entity';
import { ContactsService } from 'src/contacts/contacts.service';
import { ShareContactModel } from './shares-contact.entity';
import { ShareContactMessageModel } from './shares-contact-message.entity';
import e from 'express';

@Controller('api/shares')
@ApiTags('shares')
export class SharesController {
    constructor(private readonly sharesService: SharesService,
        private cardsService: CardsService,
        private presentationsService: PresentationsService,
        private contactsService: ContactsService,
        private sesService: SesService) {}

    @Get('/metrics')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Shares metrics retrieved successfully.'})
    public metrics(@Request() req): Promise<any> {
        const user: any = req.user;
        return this.sharesService.getMetrics(user.userId);
    }

    @Get('/deals')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Shares retrieved successfully.'})
    public findDeals(@Request() req): Promise<ShareContactModel[]> {
        const status = req.query && req.query.status ? req.query.status : null;
        const user: any = req.user;
        return this.sharesService.findDeals(user.userId, status);
    }

    @Get('/deals/:id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Shares retrieved successfully.'})
    public findDeal(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<ShareContactModel> {
        const user: any = req.user;
        return this.sharesService.findDeal(user.userId, id);
    }

    @Get('/deals/:id/messages')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Shares retrieved successfully.'})
    public findDealMessages(@Request() req, @Param('id', ParseIntPipe) id: number): Promise<ShareContactMessageModel[]> {
        const user: any = req.user;
        return this.sharesService.findDealMessages(user.userId, id);
    }

    @Post('/deals/:id/message')
    @UseGuards(JwtAuthGuard)
    @ApiCreatedResponse({ description: 'Share created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    public addMessage(@Request() req, @Body() data: ShareContactMessageModel, @Param('id', ParseIntPipe) id: number): Promise<ShareContactMessageModel> {
        return this.sharesService.addMessage({
            userId: req.user.userId,
            shareContactId: id,
            message: data.message,
            createdAt: new Date,
            updatedAt: new Date,
            user: null,
        });
    }

    @Get('/:id')
    @ApiOkResponse({ description: 'Share retrieved successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<ShareModel | any> {
        const share: ShareModel = await this.sharesService.findOne(id);

        const card =  await this.cardsService.findOne(share.cardId);
        const presentation =  await this.presentationsService.findOne(share.presentationId);

        return {
            ...share,
            card,
            presentation,
        };
    }

    @Post('/:id/deal')
    @ApiCreatedResponse({ description: 'Share created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    async deal(@Param('id', ParseIntPipe) id: number, @Body() data: any): Promise<any> {
        const deal = await this.sharesService.findAnonymousDeal(id);
        if (!deal) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        await this.sharesService.createContact({
            ...deal,
            state: 'accepted',
        });

        return {
            message: 'accepted',
        }
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Shares retrieved successfully.'})
    public findAll(@Request() req): Promise<ShareModel[]> {
        const user: any = req.user;
        return this.sharesService.findAll(user.userId);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiCreatedResponse({ description: 'Share created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    public create(@Request() req, @Body() share: ShareModel): Promise<ShareModel> {
        return this.sharesService.create({
            ...share,
            userId: req.user.userId,
        });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Share deleted successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    public delete(@Param('id', ParseIntPipe) id: number): void {  
        this.sharesService.delete(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Share updated successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    async patch(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() Share: ShareModel | any): Promise<any> {
        let contactsIds: any;
        let contactsEmails: any;

        if (Share.contacts) {
            contactsIds = Object.assign([], Share.contacts);
            delete Share.contacts;
        }

        if (Share.contactsEmails) {
            contactsEmails = Object.assign([], Share.contactsEmails);
            delete Share.contactsEmails;
        }

        const share =  await this.sharesService.findOne(id);
        if (!share) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        const rsp = await this.sharesService.update({
            ...Share,
            state: Share.state,
        });

        const card =  await this.cardsService.findOne(share.cardId);
        if (!card) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        const presentation =  await this.presentationsService.findOne(share.presentationId);
        if (!presentation) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        // TODO: Use subject/observable/emitter to deal with contacts one by one
        // which is necessary for escalability
        let contacts: any;
        if (!contactsIds || (contactsIds && contactsIds.length === 0)) {
            contacts = await this.sharesService.parseCsv(share.csvPath);
        } else {
            contacts = contactsIds;
        }

        if (contactsEmails && contactsEmails.length > 0) {
            contacts = contactsEmails.map(e => {
                return {...e, phone: ''};
            });
        }

        for(let row of contacts) {
            let contact = contactsIds && contactsIds.length ? await this.contactsService.findOne(row) :
                                   await this.contactsService.findByEmail(row.email, req.user.userId);

            if (!contact) {
                contact = await this.contactsService.create({
                    ...row,
                    userId: req.user.userId,
                });
            } else {
                await this.contactsService.update({
                    ...contact,
                    ...row,
                });

                contact = await this.contactsService.findOne(contact.id);
            }
            
            const deal: ShareContactModel = await this.sharesService.createContact({
                shareId: share.id,
                contactId: contact.id,
                state: 'sent',
                userId: req.user.userId,
                share: null,
                contact: null,
            });

            await this.sharesService.share(share, card, presentation, contact, deal);
        }
        
        // this.sharesService.share(share, card, presentation, contact);
        return rsp;
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Share updated successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() Share: ShareModel): Promise<any> {
        const rsp = await this.sharesService.update({
            ...Share,
            id
        });

        return rsp;
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads/contacts/',
            filename: function ( req, file, cb ) {
                const timestamp = new Buffer(new Date().getTime().toString()).toString('base64');
                const fileo = path.parse(file.originalname);
                cb( null, fileo.name+ '-' + timestamp + fileo.ext);
            },
        }),
    }))
    @Post(':id/contacts')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Card files uploaded successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Card files not uploaded.' })
    async uploadVideo(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: ShareModel,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const share =  await this.sharesService.findOne(id);
        if (!share) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        share.csvPath = `contacts/${file.filename}`;

        // parse CSV to extract contacts
        // verify each of them to confirm if it must be created for the current user
        // associate the contact with the share by a intermediate table which will work to mark the deal as done, closed, ignored
        return this.sharesService.update(share);
    }
}