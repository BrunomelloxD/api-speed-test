import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/request/pagination.dto';

export class GetAllSpeedTestDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter results from this date',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_from?: Date;

  @ApiPropertyOptional({
    description: 'Filter results until this date',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date_to?: Date;
}
