import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateQuestionInternalDto } from './dto/create-question-internal.dto';
import { CustomRequest } from '../shared/interfaces/custom-request';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FindAllQuestionsDto } from './dto/find-all-questions.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: CustomRequest,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    const internalDto: CreateQuestionInternalDto = {
      ...createQuestionDto,
      author: req.user.sub,
    };
    return this.questionsService.create(internalDto);
  }

  @Get()
  async findAll(@Query() query: FindAllQuestionsDto) {
    return this.questionsService.findAll(
      query.page,
      query.limit,
      query.category,
      query.search,
      query.hideWithoutAnswers,
      query.sortBy,
      query.sortOrder,
      query.userId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.questionsService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateQuestionDto,
    @Req() req: CustomRequest,
  ) {
    return this.questionsService.updateQuestion(id, updateData, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: CustomRequest) {
    await this.questionsService.deleteQuestionById(id, req.user.sub);
  }
}
