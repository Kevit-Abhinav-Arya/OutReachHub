import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Token, TokenDocument } from '../database/schemas/token.schema';

export interface TokenPayload {
  id: string;
  email: string;
  type: 'admin' | 'user' | 'temp';
  role?: string;
  workspaceId?: string;
  workspaceName?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
    private jwtService: JwtService,
  ) {}

  async createToken(payload: any): Promise<{ token: string; expiresAt: Date }> {
    const token = this.jwtService.sign(payload);
    const decoded = this.jwtService.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    const tokenDoc = new this.tokenModel({
      _id: new Types.ObjectId(),
      token,
      userId: new Types.ObjectId(payload.id),
      userType: payload.type,
      workspaceId: new Types.ObjectId(payload.workspaceId),
      expiresAt,
    });

    await tokenDoc.save();

    return { token, expiresAt };
  }

  async validateToken(token: string): Promise<{
    isValid: boolean;
    payload?: TokenPayload;
    tokenDoc?: TokenDocument;
  }> {
    try {
      const payload = this.jwtService.verify(token) as TokenPayload;

      const tokenDoc = await this.tokenModel.findOne({
        token,
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        return { isValid: false };
      }

      return {
        isValid: true,
        payload,
        tokenDoc,
      };
    } catch (error) {
      return { isValid: false };
    }
  }

  async revokeToken(token: string): Promise<boolean> {
    const result = await this.tokenModel.updateOne(
      { token },
      { isRevoked: true },
    );
    return result.modifiedCount > 0;
  }
}
