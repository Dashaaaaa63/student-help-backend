import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { QuestionDto } from './question.dto';
import { Transform } from 'class-transformer';

export class FindAllQuestionsDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value) || 1)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value) || 12)
  limit: number = 12;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || 'all')
  category: string = 'all';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || '')
  search?: string = '';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || false)
  hideWithoutAnswers: boolean = false;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value || 'createdAt')
  sortBy: keyof QuestionDto = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  @Transform(({ value }) => (value === 'asc' ? 'asc' : 'desc'))
  sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value !== '' ? value : null))
  userId: string | null;
}
