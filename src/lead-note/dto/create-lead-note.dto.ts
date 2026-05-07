import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLeadNoteDto {

  @IsString()
  @IsNotEmpty()
  note: string;

}