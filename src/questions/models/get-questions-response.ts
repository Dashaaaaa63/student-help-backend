import { QuestionDto } from '../dto/question.dto';

export interface GetQuestionsResponse {
  items: QuestionDto[];
  total: number;
}
