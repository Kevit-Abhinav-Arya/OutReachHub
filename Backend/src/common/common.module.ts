import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueriesService } from './services';
import { Admin, AdminSchema } from '../database/schemas/admin.schema';
import { User, UserSchema } from '../database/schemas/user.schema';
import {
  Workspace,
  WorkspaceSchema,
} from '../database/schemas/workspace.schema';
import { Contact, ContactSchema } from '../database/schemas/contact.schema';
import { Message, MessageSchema } from '../database/schemas/message.schema';
import { Campaign, CampaignSchema } from '../database/schemas/campaign.schema';
import {
  CampaignMessage,
  CampaignMessageSchema,
} from '../database/schemas/campaign-message.schema';
import { Token, TokenSchema } from '../database/schemas/token.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: User.name, schema: UserSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: CampaignMessage.name, schema: CampaignMessageSchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  providers: [QueriesService],
  exports: [QueriesService, MongooseModule],
})
export class CommonModule {}
