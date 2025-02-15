import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { QuestionCategory } from '../enums/question-category.enum';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  content: string;

  @IsEnum(QuestionCategory, {
    message: `Недопустимая категория. Допустимые значения: ${Object.values(QuestionCategory).join(', ')}`,
  })
  category: QuestionCategory;
}
