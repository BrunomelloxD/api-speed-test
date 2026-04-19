import { ApiProperty } from '@nestjs/swagger';

export class SpeedTestResponseDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;

    @ApiProperty({ example: 85.42 })
    download_speed: number;

    @ApiProperty({ example: 32.15 })
    upload_speed: number;

    @ApiProperty({ example: 12.5 })
    ping: number;

    @ApiProperty({ example: 3.2 })
    jitter: number | null;

    @ApiProperty({ example: '189.44.12.30' })
    ip_address: string | null;

    @ApiProperty({ example: 'Vivo Fibra' })
    isp: string | null;

    @ApiProperty({ example: 'São Paulo, BR' })
    server_location: string | null;

    @ApiProperty({ example: '2026-04-18T15:30:00.000Z' })
    tested_at: Date;
}
