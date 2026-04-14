import { Body, Controller, Get, Post } from '@nestjs/common';
import { ActivityService } from './activitychunk.service';

@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  async createActivity(@Body() createActivityDto: any) {
    const activity = await this.activityService.create(createActivityDto);
    return {
      id: activity.id,
      message: 'Chunk saved successfully',
    };
  }

  @Get()
  async getActivities() {
    const data = await this.activityService.findAll();
    return {
      data,
      total: data.length,
    };
  }
}
