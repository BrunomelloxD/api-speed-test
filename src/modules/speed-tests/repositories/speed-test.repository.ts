import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ISpeedTestRepository } from './speed-test.repository.interface';
import { PrismaService } from 'src/common/prisma/services/prisma.service';
import { PaginatedResponseDto } from 'src/common/dtos/response/paginated-response.dto';
import { SpeedTestResponseDto } from '../dtos/response/speed-test-response.dto';
import { CreateSpeedTestDto } from '../dtos/request/create-speed-test.dto';
import { GetAllSpeedTestDto } from '../dtos/request/get-all-speed-test.dto';

@Injectable()
export class SpeedTestRepository implements ISpeedTestRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async findOne(id: string): Promise<SpeedTestResponseDto | null> {
        return this.prismaService.speedTests.findUnique({
            where: { id },
        });
    }

    async create(data: CreateSpeedTestDto): Promise<SpeedTestResponseDto> {
        return this.prismaService.speedTests.create({
            data: {
                download_speed: data.download_speed,
                upload_speed: data.upload_speed,
                ping: data.ping,
                jitter: data.jitter,
                ip_address: data.ip_address,
                isp: data.isp,
                server_location: data.server_location,
            },
        });
    }

    async update(id: string, data: Partial<CreateSpeedTestDto>): Promise<SpeedTestResponseDto> {
        return this.prismaService.speedTests.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prismaService.speedTests.delete({
            where: { id },
        });
    }

    async findAll({ page = 1, limit = 10, date_from, date_to }: GetAllSpeedTestDto, ip?: string): Promise<PaginatedResponseDto<SpeedTestResponseDto>> {
        const where: Prisma.SpeedTestsWhereInput = {
            ...(ip ? { ip_address: ip } : {}),
            ...(date_from || date_to
                ? {
                      tested_at: {
                          ...(date_from && { gte: date_from }),
                          ...(date_to && { lte: date_to }),
                      },
                  }
                : {}),
        };

        const [data, total] = await this.prismaService.$transaction([
            this.prismaService.speedTests.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where,
                orderBy: { tested_at: 'desc' },
            }),
            this.prismaService.speedTests.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            },
        };
    }
}
