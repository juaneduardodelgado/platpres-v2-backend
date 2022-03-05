import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { ShareModel } from './shares.entity';
import { SharesService } from './shares.service';

@Controller('shares')
@ApiTags('shares')
export class SharesController {
    constructor(private readonly sharesService: SharesService) {}

    @Get()
    @ApiOkResponse({ description: 'Shares retrieved successfully.'})
    public findAll(): Promise<ShareModel[]> {
        return this.sharesService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Share retrieved successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<ShareModel> {
        return this.sharesService.findOne(id);
    }

    @Post()
    @ApiCreatedResponse({ description: 'Share created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    public create(@Body() Share: ShareModel): Promise<ShareModel> {
        return this.sharesService.create(Share);
    }

    @Delete(':id')
    @ApiOkResponse({ description: 'Share deleted successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    public delete(@Param('id', ParseIntPipe) id: number): void {  
        this.sharesService.delete(id);
    }

    @Put(':id')
    @ApiOkResponse({ description: 'Share updated successfully.'})
    @ApiNotFoundResponse({ description: 'Share not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Share title already exists.' })
    public update(@Param('id', ParseIntPipe) id: number, @Body() Share: ShareModel): Promise<any> {
        return this.sharesService.update({
            ...Share,
            id
        });
    }
}