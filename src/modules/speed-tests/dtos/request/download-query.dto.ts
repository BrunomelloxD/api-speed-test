import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_DOWNLOAD_BYTES = 10_000_000;
export const MAX_DOWNLOAD_BYTES = 100_000_000;

export class DownloadQueryDto {
  @ApiPropertyOptional({
    description: 'Payload size in decimal bytes',
    example: 25_000_000,
    minimum: 1,
    maximum: MAX_DOWNLOAD_BYTES,
    default: DEFAULT_DOWNLOAD_BYTES,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_DOWNLOAD_BYTES)
  bytes?: number = DEFAULT_DOWNLOAD_BYTES;
}
