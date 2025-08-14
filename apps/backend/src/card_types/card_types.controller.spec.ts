import { Test, TestingModule } from '@nestjs/testing';
import { CardTypesController } from './card_types.controller';

describe('CardTypesController', () => {
  let controller: CardTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardTypesController],
    }).compile();

    controller = module.get<CardTypesController>(CardTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
