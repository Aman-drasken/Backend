import { Test, TestingModule } from '@nestjs/testing';
import { LeadNoteController } from './lead-note.controller';

describe('LeadNoteController', () => {
  let controller: LeadNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadNoteController],
    }).compile();

    controller = module.get<LeadNoteController>(LeadNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
