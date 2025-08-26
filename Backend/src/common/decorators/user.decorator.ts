import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUser {
  id: string;
  email: string;
  type: 'admin' | 'user';
  role?: string;
  workspaceId?: string;
  workspaceName?: string;
}

export const User = createParamDecorator(
  (data: keyof CurrentUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUser;

    return data ? user?.[data] : user;
  },
);
