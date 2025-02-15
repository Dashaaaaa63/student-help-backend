import { CreateQuestionDto } from './create-question.dto';
import { IsMongoId } from 'class-validator';

export class CreateQuestionInternalDto extends CreateQuestionDto {
  @IsMongoId()
  author: string;
}
