import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

    @ApiProperty({ example: 3.2, description: 'Jitter in ms', required: false })
    @IsOptional()
    @IsNumber()
    @Min(0)
    jitter?: number;

    @ApiProperty({ example: '189.44.12.30', required: false })
    @IsOptional()
    @IsString()
    ip_address?: string;

    @ApiProperty({ example: 'Vivo Fibra', required: false })
    @IsOptional()
    @IsString()
    isp?: string;

    @ApiProperty({ example: 'São Paulo, BR', required: false })
    @IsOptional()
    @IsString()
    server_location?: string;
}
