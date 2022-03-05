import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CardModel } from './cards.entity';
import { CardsService } from './cards.service';
import { Express } from 'express';
import *  as path from 'path';
import * as multer from 'multer';
import { NotFoundError } from 'rxjs';

@Controller('api/cards')
@ApiTags('cards')
export class CardsController {
    constructor(private readonly CardsService: CardsService) {}

    @Get()
    @ApiOkResponse({ description: 'Cards retrieved successfully.'})
    public findAll(): Promise<CardModel[]> {
        return this.CardsService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Card retrieved successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<CardModel> {
        return this.CardsService.findOne(id);
    }

    @Post()
    @ApiCreatedResponse({ description: 'Card created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Card title already exists.' })
    public create(@Body() Card: CardModel): Promise<CardModel> {
        return this.CardsService.create(Card);
    }

    @Delete(':id')
    @ApiOkResponse({ description: 'Card deleted successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    public delete(@Param('id', ParseIntPipe) id: number): void {  
        this.CardsService.delete(id);
    }

    @Put(':id')
    @ApiOkResponse({ description: 'Card updated successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Card title already exists.' })
    public update(@Param('id', ParseIntPipe) id: number, @Body() Card: CardModel): Promise<any> {
        return this.CardsService.update({
            ...Card,
            id
        });
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads/files/',
            filename: function ( req, file, cb ) {
                const timestamp = new Buffer(new Date().getTime().toString()).toString('base64');
                const fileo = path.parse(file.originalname);
                cb( null, fileo.name+ '-' + timestamp + fileo.ext);
            },
        }),
    }))
    @Post(':id/logo')
    @ApiOkResponse({ description: 'Card files uploaded successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Card files not uploaded.' })
    async uploadLogo(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CardModel,
        @UploadedFile() file: Express.Multer.File,
    ) {
        console.log(file);
        const card =  await this.CardsService.findOne(id);
        if (!card) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        card.logoPath = `files/${file.filename}`;
        return this.CardsService.update(card);
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads/files/',
            filename: function ( req, file, cb ) {
                const timestamp = new Buffer(new Date().getTime().toString()).toString('base64');
                const fileo = path.parse(file.originalname);
                cb( null, fileo.name+ '-' + timestamp + fileo.ext);
            },
        }),
    }))
    @Post(':id/video')
    @ApiOkResponse({ description: 'Card files uploaded successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Card files not uploaded.' })
    async uploadVideo(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CardModel,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const card =  await this.CardsService.findOne(id);
        if (!card) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        card.videoPath = `files/${file.filename}`;
        return this.CardsService.update(card);
    }
}