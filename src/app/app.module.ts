import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { HealthModule } from 'src/modules/health/health.module';
import { SpeedTestModule } from 'src/modules/speed-tests/speed-test.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]), PrismaModule, HealthModule, SpeedTestModule]
})
export class AppModule { }
