import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { MarkBestAnswerDto } from './dto/mark-best-answer.dto';
import { AnswerRepository } from './answer.repository';
import { Types } from 'mongoose';
import { AnswerDto } from './dto/answer.dto';
import { PopulatedAnswerDocument } from './answer.schema';
import { QuestionsRepository } from '../questions/questions.repository';

@Injectable()
export class AnswersService {
  constructor(
    private readonly answerRepository: AnswerRepository,
    private readonly questionsRepository: QuestionsRepository,
  ) {}

  async createAnswer(
    createAnswerDto: CreateAnswerDto,
    authorId: string,
  ): Promise<AnswerDto> {
    const mongoAuthorId = new Types.ObjectId(authorId);
    const mongoQuestionId = new Types.ObjectId(createAnswerDto.questionId);
    const newAnswer = await this.answerRepository.create({
      author: mongoAuthorId,
      questionId: mongoQuestionId,
      content: createAnswerDto.content,
    });
    const populatedAnswer = (await newAnswer.populate({
      path: 'author',
      model: 'User',
    })) as PopulatedAnswerDocument;

    await this.questionsRepository.incrementAnswersCount(mongoQuestionId);

    return this.mapToAnswerDto(populatedAnswer);
  }

  async setBestAnswer(
    markBestDto: MarkBestAnswerDto,
    authorId: string,
  ): Promise<AnswerDto> {
    const mongoQuestionId = new Types.ObjectId(markBestDto.questionId);
    const mongoAuthorId = new Types.ObjectId(authorId);
    const mongoAnswerId = new Types.ObjectId(markBestDto.answerId);
    const question = await this.questionsRepository.findById(
      new Types.ObjectId(markBestDto.questionId),
    );

    const mongoQuestionAuthorId = new Types.ObjectId(question.author.id);
    if (!mongoQuestionAuthorId.equals(mongoAuthorId)) {
      throw new ForbiddenException(
        'Только автор вопроса может выбрать лучший ответ',
      );
    }

    await this.questionsRepository.update(mongoQuestionId, {
      bestAnswerId: mongoAnswerId,
    });

    const updatedAnswer = await this.answerRepository.updateBestStatus(
      mongoQuestionId,
      mongoAnswerId,
    );

    return this.mapToAnswerDto(updatedAnswer);
  }

  async getAnswersByQuestionId(questionId: string): Promise<AnswerDto[]> {
    const mongoQuestionId = new Types.ObjectId(questionId);
    const answerDocuments =
      await this.answerRepository.findByQuestionId(mongoQuestionId);
    const answerDtos: AnswerDto[] = [];

    answerDocuments.forEach((el) => {
      answerDtos.push(this.mapToAnswerDto(el));
    });
    return answerDtos;
  }

  async deleteAnswerById(
    answerId: string,
    authorId: string,
  ): Promise<AnswerDto> {
    const mongoAnswerId = new Types.ObjectId(answerId);
    const mongoAuthorId = new Types.ObjectId(authorId);

    const answer = await this.answerRepository.findById(mongoAnswerId);

    if (!answer) {
      throw new NotFoundException(`Ответ с ID ${answerId} не найден`);
    }

    const question = await this.questionsRepository.findById(answer.questionId);
    const mongoQuestionAuthorId = new Types.ObjectId(question.author.id);

    if (
      !mongoQuestionAuthorId.equals(mongoAuthorId) &&
      !answer.author._id.equals(mongoAuthorId)
    ) {
      throw new UnauthorizedException(
        'Ответ может удалить только автор или автор вопроса',
      );
    }
    const deletedAnswer = await this.answerRepository.deleteById(mongoAnswerId);

    await this.questionsRepository.decrementAnswersCount(question.id);

    return this.mapToAnswerDto(deletedAnswer);
  }

  private mapToAnswerDto(populatedAnswer: PopulatedAnswerDocument): AnswerDto {
    return {
      id: populatedAnswer._id.toString(),
      questionId: populatedAnswer.questionId.toString(),
      content: populatedAnswer.content,
      isBest: populatedAnswer.isBest,
      createdAt: populatedAnswer.createdAt,
      author: {
        id: populatedAnswer.author._id.toString(),
        username: populatedAnswer.author.username,
        email: populatedAnswer.author.email,
        avatar: populatedAnswer.author.avatar,
        updatedAt: populatedAnswer.author.updatedAt,
        createdAt: populatedAnswer.author.createdAt,
      },
    };
  }
}
