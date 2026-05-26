import { Test, TestingModule } from '@nestjs/testing';
import { RmeService } from './rme.service';

describe('RmeService', () => {
  let service: RmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RmeService],
    }).compile();

    service = module.get<RmeService>(RmeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
