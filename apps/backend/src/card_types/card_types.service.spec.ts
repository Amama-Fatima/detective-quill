import { Test, TestingModule } from '@nestjs/testing';
import { CardTypesService } from './card_types.service';

describe('CardTypesService', () => {
  let service: CardTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CardTypesService],
    }).compile();

    service = module.get<CardTypesService>(CardTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
