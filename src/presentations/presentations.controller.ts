import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { PresentationModel } from './presentations.entity';
import { PresentationsService } from './presentations.service';

@Controller('presentations')
@ApiTags('presentations')
export class PresentationsController {
    constructor(private readonly presentationsService: PresentationsService) {}

    @Get()
    @ApiOkResponse({ description: 'Presentations retrieved successfully.'})
    public findAll(): Promise<PresentationModel[]> {
        return this.presentationsService.findAll();
    }

    @Get(':id')
    @ApiOkResponse({ description: 'Presentation retrieved successfully.'})
    @ApiNotFoundResponse({ description: 'Presentation not found.' })
    public findOne(@Param('id', ParseIntPipe) id: number): Promise<PresentationModel> {
        return this.presentationsService.findOne(id);
    }

    @Post()
    @ApiCreatedResponse({ description: 'Presentation created successfully.' })
    @ApiUnprocessableEntityResponse({ description: 'Presentation title already exists.' })
    public create(@Body() Presentation: PresentationModel): Promise<PresentationModel> {
        return this.presentationsService.create(Presentation);
    }

    @Delete(':id')
    @ApiOkResponse({ description: 'Presentation deleted successfully.'})
    @ApiNotFoundResponse({ description: 'Presentation not found.' })
    public delete(@Param('id', ParseIntPipe) id: number): void {  
        this.presentationsService.delete(id);
    }

    @Put(':id')
    @ApiOkResponse({ description: 'Presentation updated successfully.'})
    @ApiNotFoundResponse({ description: 'Presentation not found.' })
    @ApiUnprocessableEntityResponse({ description: 'Presentation title already exists.' })
    public update(@Param('id', ParseIntPipe) id: number, @Body() Presentation: PresentationModel): Promise<any> {
        return this.presentationsService.update({
            ...Presentation,
            id
        });
    }
}