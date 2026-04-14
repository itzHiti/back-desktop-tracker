import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityChunk } from './entities/activitychunk.entity';
import { ActivityService } from './activitychunk.service';
import { ActivityController } from './activitychunk.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityChunk])],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityChunkModule {}
