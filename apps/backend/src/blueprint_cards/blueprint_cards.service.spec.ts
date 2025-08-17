import { Test, TestingModule } from '@nestjs/testing';
import { BlueprintCardsService } from './blueprint_cards.service';

describe('BlueprintCardsService', () => {
  let service: BlueprintCardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlueprintCardsService],
    }).compile();

    service = module.get<BlueprintCardsService>(BlueprintCardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
