import { Test, TestingModule } from '@nestjs/testing';
import { BuidlerController } from './buidler.controller';
import { BuidlerService } from './buidler.service';

describe('BuidlerController', () => {
  let controller: BuidlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuidlerController],
      providers: [BuidlerService],
    }).compile();

    controller = module.get<BuidlerController>(BuidlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
