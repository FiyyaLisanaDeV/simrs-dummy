import { Test, TestingModule } from '@nestjs/testing';
import { FarmasiController } from './farmasi.controller';

describe('FarmasiController', () => {
  let controller: FarmasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FarmasiController],
    }).compile();

    controller = module.get<FarmasiController>(FarmasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
