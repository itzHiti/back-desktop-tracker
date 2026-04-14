import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity()
@Unique(['startedAt', 'appName', 'appUrl'])
export class ActivityChunk {
  @ApiProperty({ format: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '2025-03-20T14:30:00.000Z' })
  @Column()
  startedAt: Date;

  @ApiProperty({ example: '2025-03-20T14:40:00.000Z' })
  @Column()
  endedAt: Date;

  @ApiProperty({ example: 600 })
  @Column()
  duration: number;

  @ApiProperty({ example: 'Visual Studio Code' })
  @Column()
  appName: string;

  @ApiPropertyOptional({ example: 'https://github.com', nullable: true })
  @Column({ type: 'text', nullable: true })
  appUrl: string | null;

  @ApiProperty({ example: '2026-04-14T12:30:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;
}
