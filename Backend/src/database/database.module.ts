import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Admin, AdminSchema } from './schemas/admin.schema';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import { User, UserSchema } from './schemas/user.schema';
import { Contact, ContactSchema } from './schemas/contact.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Campaign, CampaignSchema } from './schemas/campaign.schema';
import {
  CampaignMessage,
  CampaignMessageSchema,
} from './schemas/campaign-message.schema';
import { Token, TokenSchema } from './schemas/token.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: User.name, schema: UserSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignMessage.name, schema: CampaignMessageSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
