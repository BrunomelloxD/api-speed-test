import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaHealthIndicator } from 'src/common/prisma/indicators/prisma-health.indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOkResponse({ description: 'Database health status' })
  check() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }

  @Get('memory')
  @HealthCheck()
  @ApiOkResponse({ description: 'Memory heap health status' })
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
