import { Module } from '@nestjs/common';
import { SpeedTestController } from './controllers/speed-test.controller';
import { SpeedTestService } from './services/speed-test.service';
import { SpeedTestRepository } from './repositories/speed-test.repository';

@Module({
    controllers: [SpeedTestController],
    providers: [SpeedTestService, SpeedTestRepository],
})
export class SpeedTestModule {}
