import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { config } from './config/configuration';

// Modules
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';

// Filters
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: '.env',
    }),

    // Feature Modules
    DatabaseModule,
    CommonModule,
    AuthModule,
    WorkspacesModule,
    UsersModule,
    ContactsModule,
    MessageTemplatesModule,
    CampaignsModule,
    AnalyticsModule,
  ],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
