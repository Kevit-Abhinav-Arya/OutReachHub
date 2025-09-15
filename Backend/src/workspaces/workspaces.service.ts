import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { QueriesService } from '../common/services';
import { PaginationResponse } from '../common/dto';
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  CreateWorkspaceUserDto,
  UpdateWorkspaceUserDto,
  GetWorkspacesQueryDto,
  GetWorkspaceUsersQueryDto,
} from './dto';
import { WorkspaceResponse, WorkspaceUserResponse } from './dto/response.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly queriesService: QueriesService) {}

  // Workspace CRUD Operations

  async createWorkspace(createWorkspaceDto: CreateWorkspaceDto): Promise<{
    message: string;
    workspace: WorkspaceResponse;
  }> {
    const workspaceData = {
      name: createWorkspaceDto.name.trim(),
    };

    const workspace = await this.queriesService.createWorkspace(workspaceData);

    return {
      message: 'Workspace created successfully',
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        createdAt: workspace.createdAt,
      },
    };
  }

  async getAllWorkspaces(
    query: GetWorkspacesQueryDto,
  ): Promise<PaginationResponse<WorkspaceResponse>> {
    const { page = 1, limit = 10, search = '' } = query;

    const { workspaces, total } = await this.queriesService.listWorkspaces({
      page,
      limit,
      search,
    });

    return {
      data: workspaces.map((w) => ({
        id: w._id.toString(),
        name: w.name,
        createdAt: w.createdAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  }

  async getWorkspaceById(id: string): Promise<{
    workspace: WorkspaceResponse;
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid workspace ID');
    }

    const workspace = await this.queriesService.getWorkspaceById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const { users } = await this.queriesService.listWorkspaceUsers(id);

    const workspaceUsers = users.map((user) => {
      const workspaceAccess = user.workspaces.find(
        (w) => w.workspaceId.toString() === id,
      );
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: workspaceAccess?.role as 'Editor' | 'Viewer',
        createdAt: user.createdAt,
      };
    });

    return {
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        createdAt: workspace.createdAt,
        usersCount: users.length,
      },
    };
  }

  async updateWorkspace(
    id: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<{
    message: string;
    workspace: WorkspaceResponse;
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid workspace ID');
    }

    const updateData = {
      ...(updateWorkspaceDto.name && { name: updateWorkspaceDto.name.trim() }),
    };

    const workspace = await this.queriesService.updateWorkspace(id, updateData);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      message: 'Workspace updated successfully',
      workspace: {
        id: workspace._id.toString(),
        name: workspace.name,
        createdAt: workspace.createdAt,
      },
    };
  }

  async deleteWorkspace(id: string): Promise<{
    message: string;
  }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid workspace ID');
    }

    const workspace = await this.queriesService.getWorkspaceById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const { users } = await this.queriesService.listWorkspaceUsers(id);

    // Remove workspace from all users
    if (users.length > 0) {
      const removeUserPromises = users.map(async (user) => {
        try {
          await this.queriesService.removeUserFromWorkspace(
            user._id.toString(),
            id,
          );
          console.log(
            `User ${user.name} removed from workspace ${workspace.name} successfully`,
          );
        } catch (error) {
          console.error(
            `Error removing user ${user.name} from workspace:`,
            error,
          );
        }
      });

      await Promise.all(removeUserPromises);
      console.log('All users removed from workspace successfully');
    }

    // Now deleting the workspace
    const deletedWorkspace = await this.queriesService.deleteWorkspace(id);
    if (!deletedWorkspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      message: `Workspace '${workspace.name}' and all associated users deleted successfully`,
    };
  }

  // Workspace User Operations

  async createWorkspaceUser(
    workspaceId: string,
    createWorkspaceUserDto: CreateWorkspaceUserDto,
  ): Promise<{
    message: string;
    user: WorkspaceUserResponse;
  }> {
    if (!Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException('Invalid workspace ID');
    }

    const { email, password, name, role } = createWorkspaceUserDto;

    // Check if workspace exists
    const workspace = await this.queriesService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user already exists by email
    const existingUser = await this.queriesService.findUserByEmail(email);

    let user;
    let isNewUser = false;

    if (existingUser) {
      // User exists, check if already in this workspace
      const isUserInWorkspace = existingUser.workspaces.some((w) => {
        return w.workspaceId.toString() === workspaceId;
      });

      if (isUserInWorkspace) {
        throw new ConflictException(
          'User is already a member of this workspace',
        );
      }

      // Add existing user to workspace
      user = await this.queriesService.addUserToWorkspace(
        existingUser._id.toString(),
        workspaceId,
        workspace.name,
        role,
      );
    } else {
      // Create new user
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await this.queriesService.createWorkspaceUser({
          email,
          password: hashedPassword,
          name,
          workspaceId,
          workspaceName: workspace.name,
          role,
        });
        isNewUser = true;
      } catch (error: any) {
        if (error.code === 11000 || error.message.includes('duplicate key')) {
          throw new ConflictException(
            'A user with this email address already exists',
          );
        }
        throw error;
      }
    }

    return {
      message: `User ${isNewUser ? 'created and added to' : 'added to'} workspace ${workspace.name} successfully`,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role,
        createdAt: user.createdAt,
      },
    };
  }

  async getWorkspaceUsers(
    workspaceId: string,
    query: GetWorkspaceUsersQueryDto,
  ): Promise<PaginationResponse<WorkspaceUserResponse>> {
    if (!Types.ObjectId.isValid(workspaceId)) {
      throw new BadRequestException('Invalid workspace ID');
    }

    const { page = 1, limit = 10 } = query;

    const { users, total } = await this.queriesService.listWorkspaceUsers(
      workspaceId,
      page,
      limit,
    );

    const workspaceUsers = users.map((user) => {
      const workspaceAccess = user.workspaces.find(
        (w) => w.workspaceId.toString() === workspaceId,
      );
      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: workspaceAccess?.role as 'Editor' | 'Viewer',
        createdAt: user.createdAt,
      };
    });

    return {
      data: workspaceUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  }

  async getWorkspaceUserById(
    workspaceId: string,
    userId: string,
  ): Promise<{
    user: WorkspaceUserResponse;
  }> {
    if (
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('Invalid workspace or user ID');
    }

    const user = await this.queriesService.getWorkspaceUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user belongs to the workspace
    const workspaceAccess = user.workspaces.find((w) => {
      return w.workspaceId.toString() === workspaceId;
    });

    if (!workspaceAccess) {
      throw new NotFoundException('User not found in this workspace');
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: workspaceAccess.role as 'Editor' | 'Viewer',
        createdAt: user.createdAt,
      },
    };
  }

  async updateWorkspaceUser(
    workspaceId: string,
    userId: string,
    updateWorkspaceUserDto: UpdateWorkspaceUserDto,
  ): Promise<{
    message: string;
    user: WorkspaceUserResponse;
  }> {
    if (
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('Invalid workspace or user ID');
    }

    const user = await this.queriesService.getWorkspaceUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workspaceIndex = user.workspaces.findIndex(
      (w) => w.workspaceId.toString() === workspaceId,
    );

    if (workspaceIndex === -1) {
      throw new NotFoundException('User not found in this workspace');
    }

    let updateData: any = {};
    if (updateWorkspaceUserDto.name) {
      updateData.name = updateWorkspaceUserDto.name;
    }
    if (updateWorkspaceUserDto.role) {
      updateData[`workspaces.${workspaceIndex}.role`] =
        updateWorkspaceUserDto.role;
    }

    const updatedUser = await this.queriesService.updateWorkspaceUser(
      userId,
      updateData,
    );

    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    const workspaceAccess = updatedUser.workspaces.find(
      (w) => w.workspaceId.toString() === workspaceId,
    );

    return {
      message: 'User updated successfully',
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: workspaceAccess?.role as 'Editor' | 'Viewer',
        createdAt: updatedUser.createdAt,
      },
    };
  }

  async deleteWorkspaceUser(
    workspaceId: string,
    userId: string,
  ): Promise<{
    message: string;
  }> {
    if (
      !Types.ObjectId.isValid(workspaceId) ||
      !Types.ObjectId.isValid(userId)
    ) {
      throw new BadRequestException('Invalid workspace or user ID');
    }

    const [user, workspace] = await Promise.all([
      this.queriesService.getWorkspaceUserById(userId),
      this.queriesService.getWorkspaceById(workspaceId),
    ]);

    if (!user || !workspace) {
      throw new NotFoundException('User or workspace not found');
    }

    const workspaceAccess = user.workspaces.find(
      (w) => w.workspaceId.toString() === workspaceId,
    );

    if (!workspaceAccess) {
      throw new NotFoundException('User not found in this workspace');
    }

    await this.queriesService.removeUserFromWorkspace(userId, workspaceId);

    return {
      message: `User: ${user.name} removed from workspace: ${workspace.name} successfully`,
    };
  }
}
