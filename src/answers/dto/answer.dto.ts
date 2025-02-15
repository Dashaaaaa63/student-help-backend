import { UserDto } from '../../users/dto/user.dto';

export class AnswerDto {
  id: string;
  questionId: string;
  author?: UserDto;
  content: string;
  isBest: boolean;
  createdAt: Date;
}
