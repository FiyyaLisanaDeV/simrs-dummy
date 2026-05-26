import { Test, TestingModule } from '@nestjs/testing';
import { RmeController } from './rme.controller';

describe('RmeController', () => {
  let controller: RmeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RmeController],
    }).compile();

    controller = module.get<RmeController>(RmeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
