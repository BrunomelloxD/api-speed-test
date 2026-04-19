import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Ip, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { SpeedTestService } from '../services/speed-test.service';
import { SpeedTestResponseDto } from '../dtos/response/speed-test-response.dto';
import { PaginatedResponseDto } from 'src/common/dtos/response/paginated-response.dto';
import { CreateSpeedTestDto } from '../dtos/request/create-speed-test.dto';
import { GetAllSpeedTestDto } from '../dtos/request/get-all-speed-test.dto';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Speed Tests')
@Controller('api/speed-tests')
export class SpeedTestController {
    constructor(private readonly speedTestService: SpeedTestService) {}

    @Get('ping')
    @ApiOperation({ summary: 'Ping para medir latência' })
    @ApiOkResponse({ description: 'Pong com timestamp' })
    ping() {
        return { pong: true, timestamp: Date.now() };
    }

    @Get('download')
    @ApiOperation({ summary: 'Download de blob para medir velocidade de download' })
    @ApiQuery({ name: 'size', required: false, type: Number, description: 'Tamanho em MB (padrão: 10, máx: 100)' })
    @ApiOkResponse({ description: 'Blob binário para medição de download' })
    download(@Query('size') size: string, @Res() res: Response) {
        const sizeInMb = Math.min(Math.max(Number(size) || 10, 1), 100);
        const payload = this.speedTestService.generateDownloadPayload(sizeInMb);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Length': payload.length.toString(),
            'Content-Encoding': 'identity',
            'Cache-Control': 'no-store',
        });

        res.send(payload);
    }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Upload de blob para medir velocidade de upload' })
    @ApiOkResponse({ description: 'Confirmação com tamanho recebido e timestamp' })
    upload(@Body() body: Buffer) {
        return {
            size: Buffer.isBuffer(body) ? body.length : 0,
            timestamp: Date.now(),
        };
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os resultados de speed test', description: 'Retorna lista paginada de resultados' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página (padrão: 1)', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página (padrão: 10)', example: 10 })
    @ApiQuery({ name: 'date_from', required: false, type: String, description: 'Data inicial (YYYY-MM-DD)' })
    @ApiQuery({ name: 'date_to', required: false, type: String, description: 'Data final (YYYY-MM-DD)' })
    @ApiOkResponse({ description: 'Resultados recuperados com sucesso' })
    @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos' })
    async findAll(@Query() queryParams: GetAllSpeedTestDto, @Ip() ip: string): Promise<PaginatedResponseDto<SpeedTestResponseDto>> {
        return this.speedTestService.findAll(queryParams, ip);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Salvar resultado de speed test' })
    @ApiBody({ type: CreateSpeedTestDto })
    @ApiCreatedResponse({ description: 'Resultado salvo com sucesso', type: SpeedTestResponseDto })
    @ApiBadRequestResponse({ description: 'Dados de entrada inválidos' })
    async create(@Body() data: CreateSpeedTestDto, @Ip() ip: string): Promise<SpeedTestResponseDto> {
        return this.speedTestService.create(data, ip);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar resultado por ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID do resultado' })
    @ApiOkResponse({ description: 'Resultado encontrado', type: SpeedTestResponseDto })
    @ApiNotFoundResponse({ description: 'Resultado não encontrado' })
    async findOne(@Param('id') id: string): Promise<SpeedTestResponseDto> {
        return this.speedTestService.findOne(id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deletar resultado por ID' })
    @ApiParam({ name: 'id', type: 'string', description: 'ID do resultado' })
    @ApiNoContentResponse({ description: 'Resultado deletado com sucesso' })
    @ApiNotFoundResponse({ description: 'Resultado não encontrado' })
    async delete(@Param('id') id: string): Promise<void> {
        return this.speedTestService.delete(id);
    }
}
