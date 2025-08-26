import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ViewerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return (
      user?.type === 'admin' ||
      user?.role === 'Editor' ||
      user?.role === 'Viewer'
    );
  }
}
