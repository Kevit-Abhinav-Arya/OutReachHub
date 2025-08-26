import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { TokenService } from './token.service';
import { Admin } from '../database/schemas/admin.schema';
import { User } from '../database/schemas/user.schema';
import {
  AdminLoginDto,
  UserLoginDto,
  SelectWorkspaceDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { email, password } = adminLoginDto;

    const admin = await this.adminModel.findOne({ email }).exec();
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: admin._id.toString(),
      email: admin.email,
      type: 'admin',
      role: 'admin',
    };

    // Generating token and storing in database
    const { token } = await this.tokenService.createToken(payload);

    return {
      message: 'Login successful',
      token,
      user: {
        id: admin._id,
        email: admin.email,
        role: 'admin',
        type: 'admin',
      },
    };
  }

  async userLogin(userLoginDto: UserLoginDto) {
    const { email, password } = userLoginDto;

    const user = await this.userModel
      .findOne({ email })
      .populate('workspaces.workspaceId')
      .exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Checking if user has any workspaces
    if (!user.workspaces || user.workspaces.length === 0) {
      throw new ForbiddenException('No workspaces assigned');
    }

    // If user has only one workspace,selecting it
    if (user.workspaces.length === 1) {
      const workspace = user.workspaces[0];
      const userRole = workspace.role;
      const workspaceData = workspace.workspaceId as any;

      const payload = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        type: 'user',
        role: userRole,
        workspaceId: workspaceData._id.toString(),
        workspaceName: workspaceData.name,
      };

      const { token } = await this.tokenService.createToken(payload);

      return {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          type: 'user',
          role: userRole,
          workspaceId: workspaceData._id,
          workspaceName: workspaceData.name,
        },
      };
    }

    // If Multiple workspaces are associated with user then generatin temp token
    const availableWorkspaces = user.workspaces.map((w: any) => ({
      workspaceId: w.workspaceId._id,
      name: w.workspaceId.name,
      role: w.role,
    }));

    // Creating temporary token with 5min expiry
    const tempPayload = {
      id: user._id.toString(),
      email: user.email,
      type: 'temp',
    };

    const tempToken = this.jwtService.sign(tempPayload, { expiresIn: '5m' });

    return {
      message:
        'Multiple workspaces found. Please select a workspace within 5 minutes',
      requiresWorkspaceSelection: true,
      tempToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: 'user',
      },
      availableWorkspaces,
    };
  }

  async selectWorkspace(selectWorkspaceDto: SelectWorkspaceDto) {
    const { tempToken, workspaceId } = selectWorkspaceDto;

    // Verify temp token
    let decoded;
    try {
      decoded = this.jwtService.verify(tempToken);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          'Temporary token expired. Please login again.',
        );
      }
      throw new UnauthorizedException('Invalid temporary token');
    }

    if (decoded.type !== 'temp') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Find user with workspaces
    const user = await this.userModel
      .findById(decoded.id)
      .populate('workspaces.workspaceId')
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const workspaceAccess = user.workspaces.find(
      (w: any) => w.workspaceId._id.toString() === workspaceId,
    );

    if (!workspaceAccess) {
      throw new ForbiddenException('Access denied to this workspace');
    }

    const selectedWorkspace = workspaceAccess.workspaceId as any;
    const userRole = workspaceAccess.role;

    // Creating access token
    const payload = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      type: 'user',
      role: userRole,
      workspaceId: selectedWorkspace._id.toString(),
      workspaceName: selectedWorkspace.name,
    };

    const { token } = await this.tokenService.createToken(payload);

    return {
      message: 'Workspace selected successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: 'user',
        role: userRole,
        workspaceId: selectedWorkspace._id,
        workspaceName: selectedWorkspace.name,
      },
    };
  }

  async logout(token: string) {
    await this.tokenService.revokeToken(token);
    return { message: 'Logout successful' };
  }

  async verifyToken(token: string) {
    const { isValid, payload } = await this.tokenService.validateToken(token);

    if (!isValid || !payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return {
      valid: true,
      user: {
        id: payload.id,
        email: payload.email,
        type: payload.type,
        role: payload.role,
        workspaceId: payload.workspaceId,
        workspaceName: payload.workspaceName,
      },
    };
  }
}
