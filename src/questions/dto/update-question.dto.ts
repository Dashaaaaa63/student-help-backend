import { IsMongoId, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateQuestionDto {
  @IsOptional()
  @IsMongoId()
  bestAnswerId?: Types.ObjectId;

  @IsOptional()
  title?: string;

  @IsOptional()
  content?: string;

  @IsOptional()
  category?: string;
}
