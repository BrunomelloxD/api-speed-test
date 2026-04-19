import { SpeedTestResponseDto } from '../dtos/response/speed-test-response.dto';
import { CreateSpeedTestDto } from '../dtos/request/create-speed-test.dto';
import { IBaseRepository } from 'src/common/interfaces/base-repository.interface';

export abstract class ISpeedTestRepository extends IBaseRepository<SpeedTestResponseDto, CreateSpeedTestDto> {}
