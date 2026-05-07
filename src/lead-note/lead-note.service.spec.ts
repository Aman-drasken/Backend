import { Test, TestingModule } from '@nestjs/testing';
import { LeadNoteService } from './lead-note.service';

describe('LeadNoteService', () => {
  let service: LeadNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadNoteService],
    }).compile();

    service = module.get<LeadNoteService>(LeadNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
