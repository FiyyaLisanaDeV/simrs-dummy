import { Test, TestingModule } from '@nestjs/testing';
import { FarmasiService } from './farmasi.service';

describe('FarmasiService', () => {
  let service: FarmasiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FarmasiService],
    }).compile();

    service = module.get<FarmasiService>(FarmasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
