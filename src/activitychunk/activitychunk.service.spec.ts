import { BadRequestException, ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { ActivityService } from './activitychunk.service';
import { ActivityChunk } from './entities/activitychunk.entity';
import { CreateActivityDto } from './dtos/create-activity.dto';

type MockQueryBuilder = {
  where: jest.Mock;
  andWhere: jest.Mock;
  getOne: jest.Mock;
};

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: jest.Mocked<
    Pick<
      Repository<ActivityChunk>,
      'createQueryBuilder' | 'create' | 'save' | 'find' | 'findOneBy'
    >
  >;
  let queryBuilder: MockQueryBuilder;

  const baseDto: CreateActivityDto = {
    startedAt: '2025-03-20T14:30:00.000Z',
    endedAt: '2025-03-20T14:40:00.000Z',
    duration: 600,
    appName: 'Visual Studio Code',
    appUrl: null,
  };

  beforeEach(() => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneBy: jest.fn(),
    };

    service = new ActivityService(repository as unknown as Repository<ActivityChunk>);
  });

  it('throws 400 when duration does not match startedAt/endedAt diff', async () => {
    await expect(
      service.create({
        ...baseDto,
        duration: 999,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('throws 409 when duplicate by startedAt+appName or startedAt+appUrl exists', async () => {
    queryBuilder.getOne.mockResolvedValue({ id: 'existing-id' } as ActivityChunk);

    await expect(service.create(baseDto)).rejects.toBeInstanceOf(ConflictException);

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('activity');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('saves and returns a chunk when no duplicate exists', async () => {
    const persisted = {
      id: 'new-id',
      ...baseDto,
      startedAt: new Date(baseDto.startedAt),
      endedAt: new Date(baseDto.endedAt),
      createdAt: new Date(),
    } as ActivityChunk;

    queryBuilder.getOne.mockResolvedValue(null);
    repository.create.mockReturnValue(persisted);
    repository.save.mockResolvedValue(persisted);

    const result = await service.create(baseDto);

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(persisted);
    expect(result).toBe(persisted);
  });

  it('maps postgres unique violation 23505 to 409', async () => {
    const newChunk = { id: 'new-id' } as ActivityChunk;
    const dbError = new QueryFailedError('insert', [], { code: '23505' });

    queryBuilder.getOne.mockResolvedValue(null);
    repository.create.mockReturnValue(newChunk);
    repository.save.mockRejectedValue(dbError);

    await expect(service.create(baseDto)).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns all chunks from findAll', async () => {
    const rows = [{ id: '1' }, { id: '2' }] as ActivityChunk[];
    repository.find.mockResolvedValue(rows);

    await expect(service.findAll()).resolves.toEqual(rows);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('throws when findOne does not find a row', async () => {
    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      'Activity with id missing-id not found',
    );
  });
});
