import { Test, TestingModule } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { configureApp } from '../src/app/app.setup';
import { PrismaService } from '../src/common/prisma/services/prisma.service';
import { SpeedTestRepository } from '../src/modules/speed-tests/repositories/speed-test.repository';

const BASE = '/api/speed-tests';

const prismaMock = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

const repositoryMock = {
  findAll: jest
    .fn()
    .mockResolvedValue({ data: [], meta: { total: 0, page: 1, last_page: 0 } }),
};

describe('Speed test API (e2e)', () => {
  let app: NestExpressApplication;
  let http: App;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideProvider(SpeedTestRepository)
      .useValue(repositoryMock)
      .compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    http = app.getHttpServer() as App;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /ping', () => {
    it('answers pong with a timestamp', async () => {
      const res = await request(http).get(`${BASE}/ping`).expect(200);

      const body = res.body as { pong: unknown; timestamp: unknown };
      expect(body.pong).toBe(true);
      expect(typeof body.timestamp).toBe('number');
    });
  });

  describe('GET /download', () => {
    const download = (query: string) =>
      request(http)
        .get(`${BASE}/download${query}`)
        .buffer(true)
        .parse((res, done) => {
          let received = 0;
          res.on('data', (chunk: Buffer) => (received += chunk.length));
          res.on('end', () => done(null, received));
        });

    it('streams exactly the requested bytes with no-store octet-stream headers', async () => {
      const res = await download('?bytes=2500000').expect(200);

      expect(res.headers['content-type']).toMatch(/^application\/octet-stream/);
      expect(res.headers['content-length']).toBe('2500000');
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.body).toBe(2_500_000);
    });

    it('defaults to 10,000,000 bytes when bytes is omitted', async () => {
      const res = await download('').expect(200);

      expect(res.headers['content-length']).toBe('10000000');
      expect(res.body).toBe(10_000_000);
    });

    it.each(['0', '100000001', 'abc', '1.5'])(
      'rejects bytes=%s with 400',
      async (value) => {
        await request(http).get(`${BASE}/download?bytes=${value}`).expect(400);
      },
    );
  });

  describe('POST /upload', () => {
    it('confirms the exact number of bytes received', async () => {
      const payload = Buffer.alloc(1_000_000, 7);

      const res = await request(http)
        .post(`${BASE}/upload`)
        .set('Content-Type', 'application/octet-stream')
        .send(payload)
        .expect(200);

      const body = res.body as { size: unknown; timestamp: unknown };
      expect(body.size).toBe(1_000_000);
      expect(typeof body.timestamp).toBe('number');
    });
  });

  describe('rate limit', () => {
    const statuses = async (path: string, times: number) => {
      const codes: number[] = [];
      for (let i = 0; i < times; i++) {
        const res = await request(http).get(path);
        codes.push(res.status);
      }
      return codes;
    };

    it('answers 429 to the 61st CRUD request from the same IP within 60 s', async () => {
      const codes = await statuses(BASE, 61);

      expect(codes.slice(0, 60).every((code) => code === 200)).toBe(true);
      expect(codes[60]).toBe(429);
    });

    it('never throttles ping', async () => {
      const codes = await statuses(`${BASE}/ping`, 200);

      expect(codes.filter((code) => code !== 200)).toEqual([]);
    });

    it('never throttles download', async () => {
      const codes = await statuses(`${BASE}/download?bytes=1`, 70);

      expect(codes.filter((code) => code !== 200)).toEqual([]);
    });

    it('never throttles upload', async () => {
      const codes: number[] = [];
      for (let i = 0; i < 70; i++) {
        const res = await request(http)
          .post(`${BASE}/upload`)
          .set('Content-Type', 'application/octet-stream')
          .send(Buffer.alloc(1));
        codes.push(res.status);
      }

      expect(codes.filter((code) => code !== 200)).toEqual([]);
    });
  });

  describe('CORS preflight', () => {
    it('lets the browser cache the preflight for 600 seconds', async () => {
      const res = await request(http)
        .options(`${BASE}/upload`)
        .set('Origin', 'https://front-speed-test-production.up.railway.app')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'content-type')
        .expect(204);

      expect(res.headers['access-control-max-age']).toBe('600');
      expect(res.headers['access-control-allow-origin']).toBe('*');
    });
  });
});
