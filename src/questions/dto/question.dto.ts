import { UserDto } from '../../users/dto/user.dto';

export class QuestionDto {
  id: string;
  author: UserDto;
  title: string;
  content: string;
  bestAnswerId: string;
  answersCount: number;
  createdAt: Date;
  updatedAt: Date;
}
