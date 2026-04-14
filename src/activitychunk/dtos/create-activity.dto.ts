import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({
    example: '2025-03-20T14:30:00.000Z',
    description: 'Activity start time in ISO 8601 format',
  })
  @IsDateString()
  @IsNotEmpty()
  startedAt: string;

  @ApiProperty({
    example: '2025-03-20T14:40:00.000Z',
    description: 'Activity end time in ISO 8601 format',
  })
  @IsDateString()
  @IsNotEmpty()
  endedAt: string;

  @ApiProperty({
    example: 600,
    description: 'Duration in seconds between startedAt and endedAt',
  })
  @IsInt()
  @IsPositive()
  duration: number;

  @ApiProperty({
    example: 'Visual Studio Code',
    description: 'Application window or process name',
  })
  @IsNotEmpty()
  appName: string;

  @ApiPropertyOptional({
    example: 'https://github.com',
    nullable: true,
    description: 'Optional active URL for browser-based apps',
  })
  @IsOptional()
  @IsString()
  appUrl: string | null;
}
