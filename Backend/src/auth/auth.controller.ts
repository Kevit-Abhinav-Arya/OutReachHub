import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  AdminLoginDto,
  UserLoginDto,
  SelectWorkspaceDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  async adminLogin(@Body() adminLoginDto: AdminLoginDto, @Req() req: Request) {
    return await this.authService.adminLogin(adminLoginDto);
  }

  @Public()
  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  async userLogin(@Body() userLoginDto: UserLoginDto) {
    return await this.authService.userLogin(userLoginDto);
  }

  @Public()
  @Post('user/select-workspace')
  @HttpCode(HttpStatus.OK)
  async selectWorkspace(@Body() selectWorkspaceDto: SelectWorkspaceDto) {
    return await this.authService.selectWorkspace(selectWorkspaceDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@User('id') userId: string, @Req() req: Request) {
    const token = this.extractTokenFromHeader(req);
    return await this.authService.logout(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  async verifyToken(@Req() req: Request) {
    const token = this.extractTokenFromHeader(req);
    return await this.authService.verifyToken(token);
  }

  private extractTokenFromHeader(request: Request): string {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : '';
  }
}
