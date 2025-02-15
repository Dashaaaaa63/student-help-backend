import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDocument } from './user.schema';
import { UsersRepository } from './users.repository';
import { UserDto } from './dto/user.dto';
import { Types } from 'mongoose';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    return this.usersRepository.create(createUserDto);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(userId: string): Promise<UserDocument | null> {
    const mongoUserId = new Types.ObjectId(userId);
    return this.usersRepository.findById(mongoUserId);
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const mongoUserId = new Types.ObjectId(userId);
    return this.usersRepository.update(mongoUserId, updateUserDto);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const mongoUserId = new Types.ObjectId(userId);
    const { password } = await this.usersRepository.getPassword(mongoUserId);
    if (!password) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      password,
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Указан неверный пароль');
    }

    const isSamePassword = await bcrypt.compare(
      changePasswordDto.newPassword,
      password,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'Новый пароль должен отличаться от старого',
      );
    }

    await this.usersRepository.update(mongoUserId, {
      password: changePasswordDto.newPassword,
    });

    return { message: 'Пароль успешно изменен' };
  }

  async delete(userId: string): Promise<UserDocument> {
    const mongoUserId = new Types.ObjectId(userId);
    return this.usersRepository.delete(mongoUserId);
  }

  mapToDto(user: any): UserDto {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
