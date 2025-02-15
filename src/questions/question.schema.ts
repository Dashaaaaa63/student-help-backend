import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { QuestionCategory } from './enums/question-category.enum';
import { UserDocument } from '../users/user.schema';

@Schema({ timestamps: true })
export class Question {
  @Prop({ required: true, ref: 'User' })
  author: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(QuestionCategory),
    default: QuestionCategory.OTHER,
    required: true,
  })
  category: QuestionCategory;

  @Prop({ type: Types.ObjectId, ref: 'Answer' })
  bestAnswerId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  answersCount: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
export type QuestionDocument = HydratedDocument<Question> & {
  createdAt: Date;
  updatedAt: Date;
};
export type PopulatedQuestionDocument = Omit<QuestionDocument, 'author'> & {
  author: UserDocument;
};
