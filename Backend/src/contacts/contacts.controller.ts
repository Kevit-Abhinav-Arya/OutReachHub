import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import { Request } from "express";

import { ContactsService } from "./contacts.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ViewerGuard } from "../auth/guards/viewer.guard";
import { EditorGuard } from "../auth/guards/editor.guard";
import { CreateContactDto, UpdateContactDto, GetContactsQueryDto } from "./dto";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    workspaceId: string;
    role: string;
  };
}

@Controller("contacts")
@UseGuards(JwtAuthGuard)
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get("tags/workspace")
  @UseGuards(ViewerGuard)
  async getWorkspaceTags(@Req() req: AuthenticatedRequest) {
    return await this.contactsService.getWorkspaceTags(req.user.workspaceId);
  }

  // Create Contact
  @Post()
  @UseGuards(EditorGuard)
  @HttpCode(HttpStatus.CREATED)
  async createContact(
    @Body() createContactDto: CreateContactDto,
    @Req() req: AuthenticatedRequest
  ) {
    return await this.contactsService.createContact(
      createContactDto,
      req.user.workspaceId,
      req.user.id
    );
  }

  // Get All Contacts
  @Get()
  @UseGuards(ViewerGuard)
  async getAllContacts(
    @Query() query: GetContactsQueryDto,
    @Req() req: AuthenticatedRequest
  ) {
    return await this.contactsService.getAllContacts(
      query,
      req.user.workspaceId
    );
  }

  // Get Contact by ID
  @Get(":id")
  @UseGuards(ViewerGuard)
  async getContactById(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest
  ) {
    return await this.contactsService.getContactById(id, req.user.workspaceId);
  }

  // Update Contact
  @Put(":id")
  @UseGuards(EditorGuard)
  async updateContact(
    @Param("id") id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Req() req: AuthenticatedRequest
  ) {
    return await this.contactsService.updateContact(
      id,
      updateContactDto,
      req.user.workspaceId
    );
  }

  // Delete Contact
  @Delete(":id")
  @UseGuards(EditorGuard)
  @HttpCode(HttpStatus.OK)
  async deleteContact(
    @Param("id") id: string,
    @Req() req: AuthenticatedRequest
  ) {
    return await this.contactsService.deleteContact(id, req.user.workspaceId);
  }
}
