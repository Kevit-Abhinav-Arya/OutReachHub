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

import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  CreateWorkspaceUserDto,
  UpdateWorkspaceUserDto,
  GetWorkspacesQueryDto,
  GetWorkspaceUsersQueryDto,
} from './dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, AdminGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  // Workspace CRUD Operations
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWorkspace(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return await this.workspacesService.createWorkspace(createWorkspaceDto);
  }

  @Get()
  async getAllWorkspaces(@Query() query: GetWorkspacesQueryDto) {
    return await this.workspacesService.getAllWorkspaces(query);
  }

  @Get(':id')
  async getWorkspaceById(@Param('id') id: string) {
    return await this.workspacesService.getWorkspaceById(id);
  }

  @Put(':id')
  async updateWorkspace(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return await this.workspacesService.updateWorkspace(id, updateWorkspaceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteWorkspace(@Param('id') id: string) {
    return await this.workspacesService.deleteWorkspace(id);
  }

  // Workspace User Operations

  @Post(':workspaceId/users')
  @HttpCode(HttpStatus.CREATED)
  async createWorkspaceUser(
    @Param('workspaceId') workspaceId: string,
    @Body() createWorkspaceUserDto: CreateWorkspaceUserDto,
  ) {
    return await this.workspacesService.createWorkspaceUser(
      workspaceId,
      createWorkspaceUserDto,
    );
  }

  @Get(':workspaceId/users')
  async getWorkspaceUsers(
    @Param('workspaceId') workspaceId: string,
    @Query() query: GetWorkspaceUsersQueryDto,
  ) {
    return await this.workspacesService.getWorkspaceUsers(workspaceId, query);
  }

  @Get(':workspaceId/users/:userId')
  async getWorkspaceUserById(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return await this.workspacesService.getWorkspaceUserById(
      workspaceId,
      userId,
    );
  }

  @Put(':workspaceId/users/:userId')
  async updateWorkspaceUser(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() updateWorkspaceUserDto: UpdateWorkspaceUserDto,
  ) {
    return await this.workspacesService.updateWorkspaceUser(
      workspaceId,
      userId,
      updateWorkspaceUserDto,
    );
  }

  @Delete(':workspaceId/users/:userId')
  @HttpCode(HttpStatus.OK)
  async deleteWorkspaceUser(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    return await this.workspacesService.deleteWorkspaceUser(
      workspaceId,
      userId,
    );
  }
}
