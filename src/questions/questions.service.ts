import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Types } from 'mongoose';
import { QuestionsRepository } from './questions.repository';
import { CreateQuestionInternalDto } from './dto/create-question-internal.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GetQuestionsResponse } from './models/get-questions-response';
import { PopulatedQuestionDocument } from './question.schema';
import { QuestionDto } from './dto/question.dto';
import { AnswerRepository } from '../answers/answer.repository';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly questionsRepository: QuestionsRepository,
    private answerRepository: AnswerRepository,
  ) {}

  async create(
    createQuestionDto: CreateQuestionInternalDto,
  ): Promise<QuestionDto> {
    return this.mapToQuestionDto(
      await this.questionsRepository.create(createQuestionDto),
    );
  }

  async findById(questionId: string): Promise<QuestionDto> {
    const mongoQuestionId = new Types.ObjectId(questionId);
    const question = await this.questionsRepository.findById(mongoQuestionId);

    if (!question) {
      throw new BadRequestException('Вопрос не найден');
    }

    const dto: QuestionDto = this.mapToQuestionDto(
      await this.questionsRepository.findById(mongoQuestionId),
    );
    return dto;
  }

  async findAll(
    page: number,
    limit: number,
    category: string,
    search: string,
    hideWithoutAnswers: boolean,
    sortBy: keyof QuestionDto,
    sortOrder: 'asc' | 'desc',
    userId: string | null,
  ): Promise<GetQuestionsResponse> {
    const { items, total } = await this.questionsRepository.findAll(
      (page - 1) * limit,
      limit,
      category,
      search,
      hideWithoutAnswers,
      sortBy,
      sortOrder,
      userId,
    );

    const mappedItems = items.map((el) => this.mapToQuestionDto(el));

    return {
      total,
      items: mappedItems,
    };
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
    authorId: string,
  ): Promise<QuestionDto> {
    const mongoQuestionId = new Types.ObjectId(questionId);
    const mongoAuthorId = new Types.ObjectId(authorId);
    const question = await this.questionsRepository.findById(mongoQuestionId);

    if (!question) {
      throw new NotFoundException(`Вопрос с ID ${questionId} не найден`);
    }

    if (!mongoAuthorId.equals(question.author._id)) {
      throw new UnauthorizedException('Вопрос создавал другой пользователь');
    }

    return this.mapToQuestionDto(
      await this.questionsRepository.update(mongoQuestionId, updateQuestionDto),
    );
  }

  async deleteQuestionById(
    questionId: string,
    authorId: string,
  ): Promise<QuestionDto> {
    const mongoQuestionId = new Types.ObjectId(questionId);
    const mongoAuthorId = new Types.ObjectId(authorId);
    const question = await this.questionsRepository.findById(mongoQuestionId);

    if (!question) {
      throw new NotFoundException(`Вопрос с ID ${questionId} не найден`);
    }

    if (!question.author._id.equals(mongoAuthorId)) {
      throw new UnauthorizedException('Вопрос создавал другой пользователь');
    }

    return this.mapToQuestionDto(
      await this.questionsRepository.deleteById(mongoQuestionId),
    );
  }

  private mapToQuestionDto(
    populatedQuestion: PopulatedQuestionDocument,
  ): QuestionDto {
    return {
      id: populatedQuestion._id.toString(),
      content: populatedQuestion.content,
      title: populatedQuestion.title,
      bestAnswerId: populatedQuestion.bestAnswerId
        ? populatedQuestion.bestAnswerId.toString()
        : null,
      author: {
        id: populatedQuestion.author._id.toString(),
        avatar: populatedQuestion.author.avatar,
        email: populatedQuestion.author.email,
        username: populatedQuestion.author.username,
        createdAt: populatedQuestion.author.createdAt,
        updatedAt: populatedQuestion.author.updatedAt,
      },
      createdAt: populatedQuestion.createdAt,
      updatedAt: populatedQuestion.updatedAt,
      answersCount: populatedQuestion.answersCount,
    };
  }
}
