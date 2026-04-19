import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SpeedTestService } from '../speed-test.service';
import { SpeedTestRepository } from '../../repositories/speed-test.repository';

const mockSpeedTest = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    download_speed: 85.42,
    upload_speed: 32.15,
    ping: 12.5,
    jitter: 3.2,
    ip_address: '189.44.12.30',
    isp: 'Vivo Fibra',
    server_location: 'São Paulo, BR',
    tested_at: new Date('2026-04-18T15:30:00.000Z'),
};

const mockRepository = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
};

describe('SpeedTestService', () => {
    let service: SpeedTestService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpeedTestService,
                { provide: SpeedTestRepository, useValue: mockRepository },
            ],
        }).compile();

        service = module.get<SpeedTestService>(SpeedTestService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create and return a speed test with IP', async () => {
            mockRepository.create.mockResolvedValue(mockSpeedTest);

            const result = await service.create({
                download_speed: 85.42,
                upload_speed: 32.15,
                ping: 12.5,
            }, '189.44.12.30');

            expect(mockRepository.create).toHaveBeenCalledWith({
                download_speed: 85.42,
                upload_speed: 32.15,
                ping: 12.5,
                ip_address: '189.44.12.30',
            });
            expect(result).toEqual(mockSpeedTest);
        });
    });

    describe('findOne', () => {
        it('should return a speed test by id', async () => {
            mockRepository.findOne.mockResolvedValue(mockSpeedTest);

            const result = await service.findOne(mockSpeedTest.id);

            expect(result).toEqual(mockSpeedTest);
        });

        it('should throw NotFoundException when not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a speed test', async () => {
            mockRepository.findOne.mockResolvedValue(mockSpeedTest);
            mockRepository.delete.mockResolvedValue(undefined);

            await service.delete(mockSpeedTest.id);

            expect(mockRepository.delete).toHaveBeenCalledWith(mockSpeedTest.id);
        });

        it('should throw NotFoundException when deleting non-existent', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.delete('non-existent')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAll', () => {
        it('should return paginated results filtered by IP', async () => {
            const paginatedResult = {
                data: [mockSpeedTest],
                meta: { total: 1, page: 1, last_page: 1 },
            };
            mockRepository.findAll.mockResolvedValue(paginatedResult);

            const result = await service.findAll({ page: 1, limit: 10 }, '189.44.12.30');

            expect(mockRepository.findAll).toHaveBeenCalledWith(
                { page: 1, limit: 10 },
                '189.44.12.30',
            );
            expect(result).toEqual(paginatedResult);
        });
    });

    describe('generateDownloadPayload', () => {
        it('should generate buffer of correct size', () => {
            const payload = service.generateDownloadPayload(1);

            expect(payload.length).toBe(1 * 1024 * 1024);
        });
    });
});
