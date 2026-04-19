import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { SpeedTestRepository } from '../repositories/speed-test.repository';
import { SpeedTestResponseDto } from '../dtos/response/speed-test-response.dto';
import { PaginatedResponseDto } from 'src/common/dtos/response/paginated-response.dto';
import { CreateSpeedTestDto } from '../dtos/request/create-speed-test.dto';
import { GetAllSpeedTestDto } from '../dtos/request/get-all-speed-test.dto';

@Injectable()
export class SpeedTestService {
    constructor(private readonly speedTestRepository: SpeedTestRepository) {}

    async create(data: CreateSpeedTestDto, ip: string): Promise<SpeedTestResponseDto> {
        return this.speedTestRepository.create({ ...data, ip_address: ip });
    }

    async findAll(queryParams: GetAllSpeedTestDto, ip: string): Promise<PaginatedResponseDto<SpeedTestResponseDto>> {
        return this.speedTestRepository.findAll(queryParams, ip);
    }

    async findOne(id: string): Promise<SpeedTestResponseDto> {
        const result = await this.speedTestRepository.findOne(id);

        if (!result) {
            throw new NotFoundException(`Speed test com ID ${id} não encontrado.`);
        }

        return result;
    }

    async delete(id: string): Promise<void> {
        const result = await this.speedTestRepository.findOne(id);

        if (!result) {
            throw new NotFoundException(`Speed test com ID ${id} não encontrado.`);
        }

        await this.speedTestRepository.delete(id);
    }

    generateDownloadPayload(sizeInMb: number): Buffer {
        // Random 1MB chunk repeated — defeats HTTP compression
        const chunk = randomBytes(1024 * 1024);
        return Buffer.concat(Array.from({ length: sizeInMb }, () => chunk));
    }
}
