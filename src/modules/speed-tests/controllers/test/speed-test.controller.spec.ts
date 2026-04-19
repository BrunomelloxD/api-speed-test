import { Test, TestingModule } from '@nestjs/testing';
import { SpeedTestController } from '../speed-test.controller';
import { SpeedTestService } from '../../services/speed-test.service';

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

const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    generateDownloadPayload: jest.fn(),
};

describe('SpeedTestController', () => {
    let controller: SpeedTestController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [SpeedTestController],
            providers: [{ provide: SpeedTestService, useValue: mockService }],
        }).compile();

        controller = module.get<SpeedTestController>(SpeedTestController);
        jest.clearAllMocks();
    });

    describe('ping', () => {
        it('should return pong with timestamp', () => {
            const result = controller.ping();

            expect(result.pong).toBe(true);
            expect(result.timestamp).toBeDefined();
        });
    });

    describe('create', () => {
        it('should create a speed test result with IP', async () => {
            mockService.create.mockResolvedValue(mockSpeedTest);

            const result = await controller.create({
                download_speed: 85.42,
                upload_speed: 32.15,
                ping: 12.5,
            }, '189.44.12.30');

            expect(mockService.create).toHaveBeenCalledWith({
                download_speed: 85.42,
                upload_speed: 32.15,
                ping: 12.5,
            }, '189.44.12.30');
            expect(result).toEqual(mockSpeedTest);
        });
    });

    describe('findAll', () => {
        it('should return paginated results for IP', async () => {
            const paginated = { data: [mockSpeedTest], meta: { total: 1, page: 1, last_page: 1 } };
            mockService.findAll.mockResolvedValue(paginated);

            const result = await controller.findAll({ page: 1, limit: 10 }, '189.44.12.30');

            expect(mockService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, '189.44.12.30');
            expect(result).toEqual(paginated);
        });
    });

    describe('findOne', () => {
        it('should return a speed test by id', async () => {
            mockService.findOne.mockResolvedValue(mockSpeedTest);

            const result = await controller.findOne(mockSpeedTest.id);

            expect(result).toEqual(mockSpeedTest);
        });
    });

    describe('delete', () => {
        it('should delete a speed test', async () => {
            mockService.delete.mockResolvedValue(undefined);

            await controller.delete(mockSpeedTest.id);

            expect(mockService.delete).toHaveBeenCalledWith(mockSpeedTest.id);
        });
    });
});
