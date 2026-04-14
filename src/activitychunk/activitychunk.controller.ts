import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody, ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActivityService } from './activitychunk.service';
import { CreateActivityDto } from './dtos/create-activity.dto';

@ApiTags('activity')
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @ApiOperation({ summary: 'Create activity chunk' })
  @ApiBody({ type: CreateActivityDto })
  @ApiCreatedResponse({
    description: 'When activity chunk created successfully',
    schema: {
      properties: {
        id: { type: 'string', format: 'uuid' },
        message: { type: 'string', example: 'Chunk saved successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'When the request body is invalid (json is not valid or missing required fields)',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example:
            'Duration does not match the difference between startedAt and endedAt',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'When trying to create a chunk that already exists',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 409 },
        message: { type: 'string', example: 'Duplicate chunk already exists' },
      },
    },
  })
  @Post()
  async createActivity(@Body() createActivityDto: CreateActivityDto) {
    const activity = await this.activityService.create(createActivityDto);
    return {
      id: activity.id,
      message: 'Chunk saved successfully',
    };
  }

  @ApiOperation({ summary: 'Get all activity chunks' })
  @ApiOkResponse({
    description: 'Returns all activity chunks',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ActivityChunk' },
        },
        total: { type: 'number', example: 1 },
      },
    },
  })
  @Get()
  async getActivities() {
    const data = await this.activityService.findAll();
    return {
      data,
      total: data.length,
    };
  }
}
