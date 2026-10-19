import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpeedTestDto {
  @ApiProperty({ example: 85.42, description: 'Download speed in Mbps' })
  @IsNumber()
  @Min(0)
  download_speed: number;

  @ApiProperty({ example: 32.15, description: 'Upload speed in Mbps' })
  @IsNumber()
  @Min(0)
  upload_speed: number;

  @ApiProperty({ example: 12.5, description: 'Ping latency in ms' })
  @IsNumber()
  @Min(0)
  ping: number;

  @ApiPropertyOptional({ example: 3.2, description: 'Jitter in ms' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  jitter?: number;

  @ApiPropertyOptional({ example: '189.44.12.30' })
  @IsOptional()
  @IsString()
  ip_address?: string;

  @ApiPropertyOptional({ example: 'Vivo Fibra' })
  @IsOptional()
  @IsString()
  isp?: string;

  @ApiPropertyOptional({ example: 'São Paulo, BR' })
  @IsOptional()
  @IsString()
  server_location?: string;
}
