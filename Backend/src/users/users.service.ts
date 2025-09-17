import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { QueriesService } from '../common/services/queries.service';
import {
  CreateUserDto,
  UpdateUserDto,
  GetUsersQueryDto,
  AssignUserToWorkspaceDto,
  WorkspaceRole,
} from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly queriesService: QueriesService) {}

  // Create User
  async createUser(createUserDto: CreateUserDto) {
    const { name, email, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.queriesService.getUserByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const newUser = await this.queriesService.createUser(userData);

    // Remove password from response
    const { password: _, ...userResponse } = newUser.toObject();

    return {
      message: 'User created successfully',
      user: userResponse,
    };
  }

  // Get All Users
  async getAllUsers(query: GetUsersQueryDto) {
    const { page = 1, limit = 10, search } = query;

    let users, totalUsers;

    if (search) {
      users = await this.queriesService.searchUsers(search, page, limit);
      totalUsers = users.length;
    } else {
      users = await this.queriesService.getAllUsers(page, limit);
      totalUsers = await this.queriesService.getAllUsersCount();
    }

    // Remove passwords from response
    const usersResponse = users.map((user) => {
      const { password: _, ...userData } = user.toObject();
      return userData;
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users: usersResponse,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Get User by ID
  async getUserById(userId: string) {
    const user = await this.queriesService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password: _, ...userResponse } = user.toObject();

    return { user: userResponse };
  }

  // Update User
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const { name, email, password } = updateUserDto;

    const existingUser = await this.queriesService.getUserById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await this.queriesService.updateUser(
      userId,
      updateData,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    const { password: _, ...userResponse } = updatedUser.toObject();

    return {
      message: 'User updated successfully',
      user: userResponse,
    };
  }

  // Delete User
  async deleteUser(userId: string) {
    const existingUser = await this.queriesService.getUserById(userId);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.queriesService.deleteUser(userId);

    return {
      message: `User: ${existingUser.name} deleted successfully`,
    };
  }

  // Assign User to Workspace
  async assignUserToWorkspace(
    userId: string,
    workspaceId: string,
    assignUserDto: AssignUserToWorkspaceDto,
  ) {
    const { role = WorkspaceRole.VIEWER } = assignUserDto;

    const user = await this.queriesService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already in workspace
    const isAlreadyInWorkspace = user.workspaces.some(
      (w) => w.workspaceId._id.toString() === workspaceId,
    );

    if (isAlreadyInWorkspace) {
      throw new ConflictException('User is already assigned to this workspace');
    }

    const workspace = await this.queriesService.getWorkspaceById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const updatedUser = await this.queriesService.addUserToWorkspace(
      userId,
      workspaceId,
      workspace.name,
      role,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after workspace assignment');
    }

    return {
      message: 'User assigned to workspace successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        workspaces: updatedUser.workspaces,
      },
    };
  }

  // Remove User from Workspace
  async removeUserFromWorkspace(userId: string, workspaceId: string) {
    const user = await this.queriesService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.queriesService.removeUserFromWorkspace(
      userId,
      workspaceId,
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after workspace removal');
    }

    return {
      message: `User: ${user.name} removed from workspace successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        workspaces: updatedUser.workspaces,
      },
    };
  }

  // Get Users Not in Workspace
  async getUsersNotInWorkspace(workspaceId: string) {
    const users = await this.queriesService.getUsersNotInWorkspace(workspaceId);

    return {
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
      })),
    };
  }
}
