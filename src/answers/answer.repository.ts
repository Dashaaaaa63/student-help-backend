import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Answer,
  AnswerDocument,
  PopulatedAnswerDocument,
} from './answer.schema';

@Injectable()
export class AnswerRepository {
  constructor(
    @InjectModel(Answer.name) private answerModel: Model<AnswerDocument>,
  ) {}

  async create(answerData: Partial<Answer>): Promise<PopulatedAnswerDocument> {
    const answer = new this.answerModel(answerData);
    await answer.save();
    return await answer.populate({
      path: 'author',
      model: 'User',
    });
  }

  async findById(answerId: Types.ObjectId): Promise<PopulatedAnswerDocument> {
    const answer = await this.answerModel.findById(answerId);
    return answer.populate({ path: 'author', model: 'User' });
  }

  async updateBestStatus(
    questionId: Types.ObjectId,
    answerId: Types.ObjectId,
  ): Promise<PopulatedAnswerDocument> {
    await this.answerModel.updateMany(
      { questionId, isBest: true },
      { $set: { isBest: false } },
    );

    const updateAnswer = await this.answerModel.findByIdAndUpdate(
      answerId,
      { $set: { isBest: true } },
      { new: true },
    );

    return updateAnswer.populate({ path: 'author', model: 'User' });
  }

  async findByQuestionId(
    questionId: Types.ObjectId,
  ): Promise<PopulatedAnswerDocument[]> {
    return (await this.answerModel
      .find({ questionId })
      .sort({ isBest: 1, createdAt: -1 })
      .populate({ path: 'author', model: 'User' })
      .exec()) as unknown as PopulatedAnswerDocument[];
  }

  async deleteById(answerId: Types.ObjectId): Promise<PopulatedAnswerDocument> {
    const deletedAnswer = await this.answerModel.findByIdAndDelete(answerId);
    return deletedAnswer.populate({
      path: 'author',
      model: 'User',
    });
  }
}
