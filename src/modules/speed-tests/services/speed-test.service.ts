import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Readable } from 'stream';
import { SpeedTestRepository } from '../repositories/speed-test.repository';
import { SpeedTestResponseDto } from '../dtos/response/speed-test-response.dto';
import { PaginatedResponseDto } from 'src/common/dtos/response/paginated-response.dto';
import { CreateSpeedTestDto } from '../dtos/request/create-speed-test.dto';
import { GetAllSpeedTestDto } from '../dtos/request/get-all-speed-test.dto';

const DOWNLOAD_CHUNK_BYTES = 1_000_000;

// Random bytes defeat HTTP compression. Generated once per process and reused by
// every download, so a request costs no allocation proportional to its size.
let downloadChunk: Buffer | undefined;
function getDownloadChunk(): Buffer {
  downloadChunk ??= randomBytes(DOWNLOAD_CHUNK_BYTES);
  return downloadChunk;
}

@Injectable()
export class SpeedTestService {
  constructor(private readonly speedTestRepository: SpeedTestRepository) {}

  async create(
    data: CreateSpeedTestDto,
    ip: string,
  ): Promise<SpeedTestResponseDto> {
    return this.speedTestRepository.create({ ...data, ip_address: ip });
  }

  async findAll(
    queryParams: GetAllSpeedTestDto,
    ip: string,
  ): Promise<PaginatedResponseDto<SpeedTestResponseDto>> {
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

  createDownloadStream(bytes: number): Readable {
    const chunk = getDownloadChunk();

    function* chunks() {
      let remaining = bytes;
      while (remaining > 0) {
        const size = Math.min(remaining, chunk.length);
        yield size === chunk.length ? chunk : chunk.subarray(0, size);
        remaining -= size;
      }
    }

    return Readable.from(chunks(), { objectMode: false });
  }
}
