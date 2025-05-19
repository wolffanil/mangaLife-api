import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { Types } from 'mongoose';
import { User } from './decorators/user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserDocument } from './schemas/user.model';
import { SetBanDto } from './dto/set-ban.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/get-bans')
  @Auth('admin')
  async getBans() {
    const users = await this.userService.getIsBans();

    return { users };
  }

  @Get('profile/favorites')
  @Auth()
  async getFavorites(@User('_id') userId: Types.ObjectId) {
    const mangas = await this.userService.getFavoriteMangas(userId);

    return { mangas };
  }

  @Patch('update-profile')
  @Auth()
  async updateProfile(
    @User('_id') userId: Types.ObjectId,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.userService.updateProfile(userId, dto);

    return { user };
  }

  @Patch('profile/favorites')
  @Auth()
  async toggleFavorites(
    @Body('mangaId') mangaId: Types.ObjectId,
    @User() user: UserDocument,
  ) {
    return await this.userService.toggleFavorite(mangaId, user);
  }

  @Patch('/set-ban/:id')
  @Auth('admin')
  async setBan(
    @Param('id', IdValidationPipe) userId: Types.ObjectId,
    @Body() dto: SetBanDto,
  ) {
    const user = await this.userService.setBan(userId, dto);

    return { user };
  }

  @Patch('/set-unban/:id')
  @Auth('admin')
  async setUnBan(@Param('id', IdValidationPipe) userId: Types.ObjectId) {
    const user = await this.userService.setUnBan(userId);
    return { user };
  }
}
