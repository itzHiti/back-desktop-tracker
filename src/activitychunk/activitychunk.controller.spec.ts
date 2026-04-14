/// <reference types="jest" />
import { ActivityController } from './activitychunk.controller';
import { ActivityService } from './activitychunk.service';
import { CreateActivityDto } from './dtos/create-activity.dto';
import { ActivityChunk } from './entities/activitychunk.entity';

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: jest.Mocked<
    Pick<ActivityService, 'create' | 'findAll' | 'findByDateRange'>
  >;

  const baseDto: CreateActivityDto = {
    startedAt: '2025-03-20T14:30:00.000Z',
    endedAt: '2025-03-20T14:40:00.000Z',
    duration: 600,
    appName: 'Visual Studio Code',
    appUrl: null,
  };

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByDateRange: jest.fn(),
    };

    controller = new ActivityController(service as unknown as ActivityService);
  });

  it('createActivity returns id and success message', async () => {
    service.create.mockResolvedValue({ id: 'new-id' } as ActivityChunk);

    const result = await controller.createActivity(baseDto);

    expect(service.create).toHaveBeenCalledWith(baseDto);
    expect(result).toEqual({
      id: 'new-id',
      message: 'Chunk saved successfully',
    });
  });

  it('getActivities returns list and total count', async () => {
    const rows = [{ id: '1' }, { id: '2' }] as ActivityChunk[];
    service.findAll.mockResolvedValue(rows);

    const result = await controller.getActivities();

    expect(service.findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      data: rows,
      total: 2,
    });
  });

  it('getActivities uses date range when from and to are provided', async () => {
    const rows = [{ id: '3' }] as ActivityChunk[];
    service.findByDateRange.mockResolvedValue(rows);

    const result = await controller.getActivities('2026-04-12', '2026-04-13');

    expect(service.findByDateRange).toHaveBeenCalledWith(
      '2026-04-12',
      '2026-04-13',
    );
    expect(result).toEqual({
      data: rows,
      total: 1,
    });
  });
});
