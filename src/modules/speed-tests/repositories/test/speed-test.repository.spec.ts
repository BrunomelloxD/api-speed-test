import { Test, TestingModule } from '@nestjs/testing';
import { SpeedTestRepository } from '../speed-test.repository';
import { PrismaService } from 'src/common/prisma/services/prisma.service';

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

const mockPrismaService = {
    speedTests: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    $transaction: jest.fn(),
};

describe('SpeedTestRepository', () => {
    let repository: SpeedTestRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpeedTestRepository,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        repository = module.get<SpeedTestRepository>(SpeedTestRepository);
        jest.clearAllMocks();
    });

    describe('findOne', () => {
        it('should return a speed test by id', async () => {
            mockPrismaService.speedTests.findUnique.mockResolvedValue(mockSpeedTest);

            const result = await repository.findOne(mockSpeedTest.id);

            expect(result).toEqual(mockSpeedTest);
            expect(mockPrismaService.speedTests.findUnique).toHaveBeenCalledWith({
                where: { id: mockSpeedTest.id },
            });
        });

        it('should return null when not found', async () => {
            mockPrismaService.speedTests.findUnique.mockResolvedValue(null);

            const result = await repository.findOne('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a speed test', async () => {
            mockPrismaService.speedTests.create.mockResolvedValue(mockSpeedTest);

            const result = await repository.create({
                download_speed: 85.42,
                upload_speed: 32.15,
                ping: 12.5,
                jitter: 3.2,
                ip_address: '189.44.12.30',
                isp: 'Vivo Fibra',
                server_location: 'São Paulo, BR',
            });

            expect(result).toEqual(mockSpeedTest);
        });
    });

    describe('delete', () => {
        it('should delete a speed test', async () => {
            mockPrismaService.speedTests.delete.mockResolvedValue(mockSpeedTest);

            await repository.delete(mockSpeedTest.id);

            expect(mockPrismaService.speedTests.delete).toHaveBeenCalledWith({
                where: { id: mockSpeedTest.id },
            });
        });
    });

    describe('findAll', () => {
        it('should return paginated results', async () => {
            mockPrismaService.$transaction.mockResolvedValue([[mockSpeedTest], 1]);

            const result = await repository.findAll({ page: 1, limit: 10 }, '189.44.12.30');

            expect(result.data).toEqual([mockSpeedTest]);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
            expect(result.meta.last_page).toBe(1);
        });

        it('should filter by date range', async () => {
            mockPrismaService.$transaction.mockResolvedValue([[], 0]);

            await repository.findAll({
                page: 1,
                limit: 10,
                date_from: new Date('2026-01-01'),
                date_to: new Date('2026-12-31'),
            }, '189.44.12.30');

            expect(mockPrismaService.$transaction).toHaveBeenCalled();
        });
    });
});
