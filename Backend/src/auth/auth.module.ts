import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { EditorGuard } from './guards/editor.guard';
import { ViewerGuard } from './guards/viewer.guard';
import { TokenService } from './token.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtAuthGuard,
    AdminGuard,
    EditorGuard,
    ViewerGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    JwtAuthGuard,
    AdminGuard,
    EditorGuard,
    ViewerGuard,
  ],
})
export class AuthModule {}
