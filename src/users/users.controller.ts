import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomRequest } from '../shared/interfaces/custom-request';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@Req() req: CustomRequest) {
    const user = await this.usersService.findById(req.user.sub);
    return this.usersService.mapToDto(user);
  }

  @Put()
  async updateUser(
    @Req() req: CustomRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(
      req.user.sub,
      updateUserDto,
    );
    return this.usersService.mapToDto(updatedUser);
  }

  @Put('change-password')
  async changePassword(
    @Req() req: CustomRequest,
    @Body() body: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.sub as string; // Получаем id из Request
    return this.usersService.changePassword(userId, body);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Req() req: CustomRequest) {
    await this.usersService.delete(req.user.sub);
  }
}
