import { Test, TestingModule } from '@nestjs/testing';
import { CasemixController } from './casemix.controller';

describe('CasemixController', () => {
  let controller: CasemixController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CasemixController],
    }).compile();

    controller = module.get<CasemixController>(CasemixController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
