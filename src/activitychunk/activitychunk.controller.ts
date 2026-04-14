import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
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
  @ApiUnprocessableEntityResponse({
    description: 'When appName is missing or empty',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 422 },
        message: {
          type: 'string',
          example: 'appName is missing or empty. Please provide a valid value',
        },
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
  @ApiQuery({
    name: 'from',
    description: 'Optional start date in ISO format (e.g., 2026-04-12)',
    required: false,
    example: '2026-04-12',
  })
  @ApiQuery({
    name: 'to',
    description: 'Optional end date in ISO format (e.g., 2026-04-13)',
    required: false,
    example: '2026-04-13',
  })
  @ApiOkResponse({
    description: 'Returns all activity chunks',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ActivityChunk' },
        },
        total: { type: 'number', example: 50 },
      },
    },
  })
  @Get()
  async getActivities(@Query('from') from?: string, @Query('to') to?: string) {
    const data =
      from && to
        ? await this.activityService.findByDateRange(from, to)
        : await this.activityService.findAll();

    return {
      data,
      total: data.length,
    };
  }
}
