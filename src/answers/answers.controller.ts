import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Get,
  Put,
  Delete,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { MarkBestAnswerDto } from './dto/mark-best-answer.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { CustomRequest } from '../shared/interfaces/custom-request';
import { AnswerDto } from './dto/answer.dto';

@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAnswerDto: CreateAnswerDto,
    @Req() req: CustomRequest,
  ) {
    return this.answersService.createAnswer(createAnswerDto, req.user.sub);
  }

  @Put('best')
  @UseGuards(JwtAuthGuard)
  async markBest(
    @Body() markBestDto: MarkBestAnswerDto,
    @Req() req: CustomRequest,
  ) {
    return this.answersService.setBestAnswer(markBestDto, req.user.sub);
  }

  @Get(':questionId')
  async getAnswersByQuestionsId(
    @Param('questionId') questionId: string,
  ): Promise<AnswerDto[]> {
    return this.answersService.getAnswersByQuestionId(questionId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteById(@Param('id') id: string, @Req() req: CustomRequest) {
    await this.answersService.deleteAnswerById(id, req.user.sub);
  }
}
