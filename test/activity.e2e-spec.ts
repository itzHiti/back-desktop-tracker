import { INestApplication, ValidationPipe, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ValidationError } from 'class-validator';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { ActivityChunk } from '../src/activitychunk/entities/activitychunk.entity';
import { HttpExceptionFilter } from '../src/shared/http-exception.filter';

describe('Activity API (e2e)', () => {
  let app: INestApplication;
  let repositoryMock: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    findOneBy: jest.Mock;
  };
  let queryBuilderMock: {
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
    getMany: jest.Mock;
  };

  const basePayload = {
    startedAt: '2025-03-20T14:30:00.000Z',
    endedAt: '2025-03-20T14:40:00.000Z',
    duration: 600,
    appName: 'Visual Studio Code',
    appUrl: null,
  };

  beforeEach(async () => {
    queryBuilderMock = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
      getMany: jest.fn().mockResolvedValue([]),
    };

    repositoryMock = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
      create: jest.fn().mockImplementation((value) => ({
        id: 'generated-id',
        createdAt: new Date('2025-03-20T14:41:00.000Z'),
        ...value,
      })),
      save: jest.fn().mockImplementation(async (value) => value),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn().mockResolvedValue(null),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(ActivityChunk))
      .useValue(repositoryMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
          const appNameError = errors.find((error) => error.property === 'appName');

          if (appNameError?.constraints?.isNotEmpty) {
            return new UnprocessableEntityException(
              'appName is missing or empty. Please provide a valid value',
            );
          }

          const messages = errors.flatMap((error) =>
            error.constraints ? Object.values(error.constraints) : [],
          );

          return new BadRequestException(messages);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates activity chunk and returns 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/activity')
      .send(basePayload)
      .expect(201);

    expect(response.body).toEqual({
      id: 'generated-id',
      message: 'Chunk saved successfully',
    });
    expect(repositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when startedAt + appName duplicates', async () => {
    queryBuilderMock.getOne.mockResolvedValueOnce({ id: 'existing-id' } as ActivityChunk);

    const response = await request(app.getHttpServer())
      .post('/api/activity')
      .send(basePayload)
      .expect(409);

    expect(response.body.message).toContain('Duplicate chunk already exists');
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it('returns 409 when startedAt + appUrl duplicates', async () => {
    queryBuilderMock.getOne.mockResolvedValueOnce({ id: 'existing-id' } as ActivityChunk);

    const response = await request(app.getHttpServer())
      .post('/api/activity')
      .send({
        ...basePayload,
        appName: 'Different App',
        appUrl: 'https://github.com',
      })
      .expect(409);

    expect(response.body.message).toContain('Duplicate chunk already exists');
    expect(repositoryMock.save).not.toHaveBeenCalled();
  });

  it('returns 422 for empty appName', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/activity')
      .send({
        ...basePayload,
        appName: '',
      })
      .expect(422);

    expect(response.body.message).toBe(
      'appName is missing or empty. Please provide a valid value',
    );
  });

  it('returns 400 for duration mismatch', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/activity')
      .send({
        ...basePayload,
        duration: 123,
      })
      .expect(400);

    expect(response.body.message).toContain(
      'Duration does not match the difference between startedAt and endedAt',
    );
  });

  it('returns all chunks with total count', async () => {
    repositoryMock.find.mockResolvedValueOnce([
      {
        id: 'generated-id',
        ...basePayload,
        startedAt: new Date(basePayload.startedAt),
        endedAt: new Date(basePayload.endedAt),
        createdAt: new Date('2025-03-20T14:41:00.000Z'),
      },
    ] as ActivityChunk[]);

    const response = await request(app.getHttpServer())
      .get('/api/activity')
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe('generated-id');
  });

  it('returns filtered chunks from root GET when from and to are provided', async () => {
    queryBuilderMock.getMany.mockResolvedValueOnce([
      {
        id: 'filtered-id',
        ...basePayload,
        startedAt: new Date(basePayload.startedAt),
        endedAt: new Date(basePayload.endedAt),
        createdAt: new Date('2025-03-20T14:41:00.000Z'),
      },
    ] as ActivityChunk[]);

    const response = await request(app.getHttpServer())
      .get('/api/activity')
      .query({ from: '2026-04-12', to: '2026-04-13' })
      .expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.data[0].id).toBe('filtered-id');
  });

});
