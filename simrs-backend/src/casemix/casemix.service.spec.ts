import { Test, TestingModule } from '@nestjs/testing';
import { CasemixService } from './casemix.service';

describe('CasemixService', () => {
  let service: CasemixService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CasemixService],
    }).compile();

    service = module.get<CasemixService>(CasemixService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
