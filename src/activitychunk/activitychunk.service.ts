import { ActivityChunk } from './entities/activitychunk.entity';
import { Brackets, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
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

    const duplicate = await this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.startedAt = :startedAt', { startedAt })
      .andWhere(
        new Brackets((qb) => {
          qb.where('activity.appName = :appName', { appName: dto.appName });

          if (dto.appUrl === null) {
            qb.orWhere('activity.appUrl IS NULL');
          } else {
            qb.orWhere('activity.appUrl = :appUrl', { appUrl: dto.appUrl });
          }
        }),
      )
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Duplicate chunk already exists for startedAt + appName or startedAt + appUrl',
      );
    }

    const activity = this.activityRepository.create({
      ...dto,
      startedAt,
      endedAt,
    });
    try {
      return await this.activityRepository.save(activity);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as { code?: string };
        if (driverError?.code === '23505') {
          throw new ConflictException(
            'Duplicate chunk already exists for startedAt + appName or startedAt + appUrl',
          );
        }
      }

      throw error;
    }
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

  async findByDateRange(start: string, end: string): Promise<ActivityChunk[]> {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.activityRepository
      .createQueryBuilder('activity')
      .where('activity.startedAt >= :start', { start: startDate })
      .andWhere('activity.startedAt <= :end', { end: endDate })
      .getMany();
  }
}
