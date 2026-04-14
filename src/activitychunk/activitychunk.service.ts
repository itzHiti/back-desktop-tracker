import { ActivityChunk } from './entities/activitychunk.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dtos/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityChunk)
    private readonly activityRepository: Repository<ActivityChunk>,
  ) {}

  async create(dto: CreateActivityDto): Promise<ActivityChunk> {
    const startedAt = new Date(dto.startedAt);
    const endedAt = new Date(dto.endedAt);
    const duration = (endedAt.getTime() - startedAt.getTime()) / 1000; // <- convert to seconds

    if (Math.abs(duration - Number(dto.duration)) > 5) {
      throw new BadRequestException(
        'Duration does not match the difference between startedAt and endedAt',
      );
    }

    const activity = this.activityRepository.create({
      ...dto,
      startedAt,
      endedAt,
    });
    return this.activityRepository.save(activity);
  }

  async findAll(): Promise<ActivityChunk[]> {
    return this.activityRepository.find();
  }

  async findOne(id: string): Promise<ActivityChunk> {
    const activity = await this.activityRepository.findOneBy({ id });
    if (!activity) {
      throw new Error(`Activity with id ${id} not found`);
    }
    return activity;
  }
}
