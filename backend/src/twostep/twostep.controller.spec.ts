import { Test, TestingModule } from '@nestjs/testing';
import { TwostepController } from './twostep.controller';

describe('TwostepController', () => {
  let controller: TwostepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TwostepController],
    }).compile();

    controller = module.get<TwostepController>(TwostepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
