import { Test, TestingModule } from '@nestjs/testing';
import { BuidlerService } from './buidler.service';

describe('BuidlerService', () => {
  let service: BuidlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BuidlerService],
    }).compile();

    service = module.get<BuidlerService>(BuidlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
