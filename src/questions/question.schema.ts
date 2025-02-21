import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { QuestionCategory } from './enums/question-category.enum';
import { UserDocument } from '../users/user.schema';
import { Answer, AnswerDocument } from '../answers/answer.schema';

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

// Хук для deleteOne
QuestionSchema.pre(
  'deleteOne',
  { document: true, query: false },
  async function (next) {
    // this ссылается на документ
    // Удаляем все ответы, связанные с этим вопросом
    const answerModel = this.$model(Answer.name);
    await answerModel.deleteMany({ questionId: this._id });
    next();
  },
);

// Хук для findOneAndDelete (включая findByIdAndDelete)
QuestionSchema.pre('findOneAndDelete', async function (next) {
  const question = await this.model.findOne(this.getFilter()); // Получаем документ вопроса

  if (question) {
    // Удаляем все ответы, связанные с этим вопросом
    const answerModel = question.$model(Answer.name);
    await answerModel.deleteMany({ questionId: question._id });
  }

  next();
});
