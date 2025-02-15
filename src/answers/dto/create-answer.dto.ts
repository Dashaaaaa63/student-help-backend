import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsMongoId,
} from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  content: string;

  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  questionId: string;
}
