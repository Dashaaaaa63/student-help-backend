import { IsMongoId } from 'class-validator';

export class MarkBestAnswerDto {
  @IsMongoId()
  questionId: string;

  @IsMongoId()
  answerId: string;
}
