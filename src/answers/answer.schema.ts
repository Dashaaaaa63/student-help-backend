import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserDocument } from '../users/user.schema';

@Schema({ timestamps: true })
export class Answer {
  @Prop({ type: Types.ObjectId, ref: 'Question', required: true })
  questionId: Types.ObjectId;

  @Prop({ ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isBest: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
export type AnswerDocument = HydratedDocument<Answer> & {
  createdAt: Date;
  updatedAt: Date;
};
export type PopulatedAnswerDocument = Omit<AnswerDocument, 'author'> & {
  author: UserDocument;
};
