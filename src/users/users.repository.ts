import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: any): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(userId: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec();
  }

  async update(
    userId: Types.ObjectId,
    updateData: any,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

  async delete(userId: Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findByIdAndDelete(userId).exec();
  }

  async getPassword(userId: Types.ObjectId): Promise<UserDocument> {
    return this.userModel.findOne(userId).select('password').exec();
  }
}
