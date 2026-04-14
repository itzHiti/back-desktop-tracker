import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateActivityDto {
  @IsDateString()
  @IsNotEmpty()
  startedAt: string;
  @IsDateString()
  @IsNotEmpty()
  endedAt: string;
  @IsInt()
  @IsPositive()
  duration: number;
  @IsNotEmpty()
  appName: string;
  @IsOptional()
  @IsString()
  appUrl: string | null;
}
