import { Test, TestingModule } from '@nestjs/testing';
import { BlueprintCardsController } from './blueprint_cards.controller';

describe('BlueprintCardsController', () => {
  let controller: BlueprintCardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlueprintCardsController],
    }).compile();

    controller = module.get<BlueprintCardsController>(BlueprintCardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
