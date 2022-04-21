import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Put, UploadedFile, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import *  as path from 'path';
import * as multer from 'multer';
import * as slug from 'slug';
import { PresentationModel } from './presentations.entity';
import { PresentationsService } from './presentations.service';
import * as transcoderHelper from '../cards/transcoder.helper';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GoogleOauthGuard } from 'src/auth/google-oauth.guard';

@Controller('api/presentations')
@ApiTags('presentations')
export class PresentationsController {
    constructor(private readonly presentationsService: PresentationsService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Presentations retrieved successfully.'})
    public findAll(@Request() req): Promise<PresentationModel[]> {
        const user: any = req.user;
        return this.presentationsService.findAll(user.userId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Presentation retrieved successfully.'})
    @ApiNotFoundResponse({ description: 'Presentation not found.' })
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<PresentationModel> {
        return this.presentationsService.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiCreatedResponse({ description: 'Presentation created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Presentation title already exists.' })
    public create(@Request() req, @Body() presentation: PresentationModel): Promise<PresentationModel> {
        return this.presentationsService.create({
            ...presentation,
            userId: req.user.userId,
        });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Presentation deleted successfully.'})
    @ApiNotFoundResponse({ description: 'Presentation not found.' })
    public delete(@Param('id', ParseIntPipe) id: number): void {  
        this.presentationsService.delete(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Presentation updated successfully.'})
    @ApiNotFoundResponse({ description: 'Presentation not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Presentation title already exists.' })
    public update(@Param('id', ParseIntPipe) id: number, @Body() Presentation: PresentationModel): Promise<any> {
        return this.presentationsService.update({
            ...Presentation,
            id
        });
    }

    uploadRemotely = function(file, id) {
        var _file = './uploads/files/' + file;
        var ext = path.extname(_file);
        var s3filepath = path.dirname(_file) + '/' + slug(path.basename(_file, ext)) + ext;

        return new Promise((resolve, reject) => {
            transcoderHelper.uploadToS3(_file, s3filepath, id).then((uri) => {
                resolve({uri, file});
            }).catch((reason) => {
                reject(reason);
            });
        });
    };

    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads/files/',
            filename: function ( req, file, cb ) {
                const timestamp = new Buffer(new Date().getTime().toString()).toString('base64');
                const fileo = path.parse(file.originalname);
                cb( null, slug(fileo.name + '-' + timestamp) + fileo.ext);
            },
        }),
    }))
    @Post(':id/thumb')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Card files uploaded successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Card files not uploaded.' })
    async uploadLogo(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: PresentationModel,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const presentation =  await this.presentationsService.findOne(id);
        if (!presentation) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }

        const response: any = await this.uploadRemotely(file.filename, presentation.id);
        presentation.thumbPath = `files/${file.filename}`;
        presentation.thumbUri = response.uri;
        return this.presentationsService.update(presentation);
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './uploads/files/',
            filename: function ( req, file, cb ) {
                const timestamp = new Buffer(new Date().getTime().toString()).toString('base64');
                const fileo = (path.parse(file.originalname));
                cb( null, slug(fileo.name + '-' + timestamp) + fileo.ext);
            },
        }),
    }))
    @Post(':id/video')
    @UseGuards(JwtAuthGuard)
    @ApiOkResponse({ description: 'Card files uploaded successfully.'})
    @ApiNotFoundResponse({ description: 'Card not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Card files not uploaded.' })
    async uploadVideo(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: PresentationModel,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const presentation =  await this.presentationsService.findOne(id);
        if (!presentation) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
        const response: any = await this.uploadRemotely(file.filename, presentation.id);
        presentation.videoPath = `files/${file.filename}`;
        presentation.videoUri = response.uri;
        return this.presentationsService.update(presentation);
    }
}