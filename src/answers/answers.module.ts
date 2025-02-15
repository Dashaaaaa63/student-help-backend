import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { Answer, AnswerSchema } from './answer.schema';
import { AnswerRepository } from './answer.repository';
import { Question, QuestionSchema } from '../questions/question.schema';
import { JwtService } from '@nestjs/jwt';
import { QuestionsModule } from '../questions/questions.module';
import { User } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Answer.name, schema: AnswerSchema },
      { name: User.name, schema: User },
    ]),
    forwardRef(() => QuestionsModule),
  ],
  controllers: [AnswersController],
  providers: [AnswersService, AnswerRepository, JwtService],
  exports: [AnswersService, AnswerRepository],
})
export class AnswersModule {}
