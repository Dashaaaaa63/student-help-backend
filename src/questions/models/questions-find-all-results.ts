import { PopulatedQuestionDocument } from "../question.schema";

export interface QuestionsFindAllResults {
  items: PopulatedQuestionDocument[];
  total: number;
}