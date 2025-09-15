import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [DatabaseModule, CommonModule, AuthModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
