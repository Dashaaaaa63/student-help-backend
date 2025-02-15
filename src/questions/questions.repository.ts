import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PopulatedQuestionDocument,
  Question,
  QuestionDocument,
} from './question.schema';
import { CreateQuestionInternalDto } from './dto/create-question-internal.dto';
import { QuestionsFindAllResults } from './models/questions-find-all-results';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
  ) {}

  async create(
    createQuestionDto: CreateQuestionInternalDto,
  ): Promise<PopulatedQuestionDocument> {
    const createdQuestion = new this.questionModel(createQuestionDto);
    await createdQuestion.save();
    return await createdQuestion.populate({ path: 'author', model: 'User' });
  }

  async findById(
    questionId: Types.ObjectId,
  ): Promise<PopulatedQuestionDocument> {
    const question = await this.questionModel.findById(questionId);

    const populatedQuestion: PopulatedQuestionDocument =
      await question.populate({ path: 'author', model: 'User' });
    return populatedQuestion;
  }

  async findAll(
    skip: number,
    limit: number,
    category: string,
    search: string,
    hideWithoutAnswers: boolean,
    sortBy: keyof QuestionDocument,
    sortOrder: 'asc' | 'desc',
    userId: string | null,
  ): Promise<QuestionsFindAllResults> {
    const filters: any = {};

    // Фильтр по категории
    if (category && category !== 'all') {
      filters.category = category;
    }

    // Фильтр по поисковому запросу
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    // Фильтр по наличию ответов
    if (hideWithoutAnswers) {
      filters.answersCount = { $gt: 0 }; // Только вопросы с ответами
    }

    // Фильтр по пользователю
    if (userId) {
      filters.author = userId;
    }

    // Запрос к базе данных
    const [items, total] = await Promise.all([
      (await this.questionModel
        .find(filters)
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .populate({ path: 'author', model: 'User' })
        .exec()) as unknown as PopulatedQuestionDocument[],
      this.questionModel.countDocuments(filters),
    ]);

    return { items, total };
  }

  async update(
    id: Types.ObjectId,
    updateData: any,
  ): Promise<PopulatedQuestionDocument | null> {
    return (await this.questionModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-answers')
      .populate({ path: 'author', model: 'User' })
      .exec()) as unknown as PopulatedQuestionDocument;
  }

  async deleteById(id: Types.ObjectId): Promise<PopulatedQuestionDocument> {
    return (await this.questionModel
      .findByIdAndDelete(id)
      .populate({ path: 'author', model: 'User' })
      .exec()) as unknown as PopulatedQuestionDocument;
  }

  async incrementAnswersCount(questionId: Types.ObjectId): Promise<void> {
    await this.questionModel.updateOne(
      { _id: questionId },
      { $inc: { answersCount: 1 } },
    );
  }

  async decrementAnswersCount(questionId: Types.ObjectId): Promise<void> {
    await this.questionModel.updateOne(
      { _id: questionId },
      { $inc: { answersCount: -1 } },
    );
  }
}
