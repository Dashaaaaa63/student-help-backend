import { UserDto } from '../../users/dto/user.dto';
import { QuestionCategory } from '../enums/question-category.enum';

export class QuestionDto {
  id: string;
  author: UserDto;
  title: string;
  content: string;
  category: QuestionCategory;
  bestAnswerId: string;
  answersCount: number;
  createdAt: Date;
  updatedAt: Date;
}
