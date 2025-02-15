import { forwardRef, Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionsRepository } from './questions.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './question.schema';
import { JwtService } from '@nestjs/jwt';
import { Answer, AnswerSchema } from '../answers/answer.schema';
import { AnswersModule } from '../answers/answers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Answer.name, schema: AnswerSchema },
    ]),
    forwardRef(() => AnswersModule),
  ],
  providers: [QuestionsService, QuestionsRepository, JwtService],
  controllers: [QuestionsController],
  exports: [QuestionsService, QuestionsRepository],
})
export class QuestionsModule {}
