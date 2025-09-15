import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [DatabaseModule, CommonModule, AuthModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
