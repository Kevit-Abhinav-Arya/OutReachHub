import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
  AssignUserToWorkspaceDto,
} from './dto';

@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // User CRUD Operations
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }

  @Get()
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return await this.usersService.getAllUsers(query);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string) {
    return await this.usersService.getUserById(userId);
  }

  @Put(':userId')
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.updateUser(userId, updateUserDto);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('userId') userId: string) {
    return await this.usersService.deleteUser(userId);
  }

  // Workspace Assignment Operations
  @Post(':userId/workspaces/:workspaceId')
  @HttpCode(HttpStatus.CREATED)
  async assignUserToWorkspace(
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() assignUserDto: AssignUserToWorkspaceDto,
  ) {
    return await this.usersService.assignUserToWorkspace(
      userId,
      workspaceId,
      assignUserDto,
    );
  }

  @Delete(':userId/workspaces/:workspaceId')
  @HttpCode(HttpStatus.OK)
  async removeUserFromWorkspace(
    @Param('userId') userId: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    return await this.usersService.removeUserFromWorkspace(userId, workspaceId);
  }

  // Get users not in a specific workspace
  @Get('available/:workspaceId')
  async getUsersNotInWorkspace(@Param('workspaceId') workspaceId: string) {
    return await this.usersService.getUsersNotInWorkspace(workspaceId);
  }
}
