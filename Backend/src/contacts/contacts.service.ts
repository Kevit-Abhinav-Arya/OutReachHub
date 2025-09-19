import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { QueriesService } from '../common/services/queries.service';
import { CreateContactDto, UpdateContactDto, GetContactsQueryDto } from './dto';

@Injectable()
export class ContactsService {
  constructor(private readonly queriesService: QueriesService) {}

  // Create Contact
  async createContact(
    createContactDto: CreateContactDto,
    workspaceId: string,
    createdBy: string,
  ) {
    const {
      name,
      phoneNumber,
      email,
      company,
      tags = [],
      notes,
    } = createContactDto;

    // Checking if phone number already exists in workspace
    const existingContact = await this.queriesService.checkPhoneNumberExists(
      workspaceId,
      phoneNumber.trim(),
    );

    if (existingContact) {
      throw new ConflictException(
        'Contact with this phone number already exists in this workspace',
      );
    }

    const contactData = {
      workspaceId,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim(),
      company: company.trim(),
      tags: tags.map((tag) => tag.trim()),
      notes,
      createdBy,
    };

    const contact = await this.queriesService.createContact(contactData);

    return {
      message: 'Contact created successfully',
      contact: {
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        tags: contact.tags,
        createdAt: contact.createdAt,
        email: contact.email,
        company: contact.company,
      },
    };
  }

  // Get All Contacts
  async getAllContacts(query: GetContactsQueryDto, workspaceId: string) {
    const { page = 1, limit = 10, search = '', tags } = query;

    const tagArray = tags
      ? tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag)
      : [];

    const { contacts, total } = await this.queriesService.listContacts(
      workspaceId,
      {
        page,
        limit,
        search,
        tagFilter: tagArray.length > 0 ? tagArray[0] : undefined,
      },
    );

    return {
      contacts: contacts.map((contact: any) => ({
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        company: contact.company,
        tags: contact.tags,
        notes: contact.notes,
        createdBy: {
          id: contact.createdBy._id,
          name: contact.createdBy.name,
          email: contact.createdBy.email,
        },
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        limit,
      },
    };
  }

  // Get Contact by ID
  async getContactById(contactId: string, workspaceId: string) {
    const contact: any = await this.queriesService.getContactById(
      contactId,
      workspaceId,
    );

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return {
      contact: {
        id: contact._id,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        company: contact.company,
        tags: contact.tags,
        notes: contact.notes,
        createdBy: {
          id: contact.createdBy._id,
          name: contact.createdBy.name,
          email: contact.createdBy.email,
        },
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    };
  }

  // Update Contact
  async updateContact(
    contactId: string,
    updateContactDto: UpdateContactDto,
    workspaceId: string,
  ) {
    const { name, phoneNumber, email, company, tags, notes } = updateContactDto;

    const contact = await this.queriesService.getContactById(
      contactId,
      workspaceId,
    );

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    const updateFields: any = { updatedAt: new Date() };

    if (name !== undefined) {
      if (!name.trim()) {
        throw new BadRequestException('Name cannot be empty');
      }
      updateFields.name = name.trim();
    }

    if (phoneNumber !== undefined) {
      if (!phoneNumber.trim()) {
        throw new BadRequestException('Phone number cannot be empty');
      }

      if (phoneNumber.trim() !== contact.phoneNumber) {
        const existingContact =
          await this.queriesService.checkPhoneNumberExists(
            workspaceId,
            phoneNumber.trim(),
          );

        if (existingContact) {
          throw new ConflictException(
            'Phone number is already used by another contact in this workspace',
          );
        }
      }

      updateFields.phoneNumber = phoneNumber.trim();
    }

    if (email !== undefined) {
      if (!email.trim()) {
        throw new BadRequestException('Email cannot be empty');
      }
      updateFields.email = email.toLowerCase().trim();
    }

    if (company !== undefined) {
      if (!company.trim()) {
        throw new BadRequestException('Company cannot be empty');
      }
      updateFields.company = company.trim();
    }

    if (tags !== undefined) {
      updateFields.tags = Array.isArray(tags)
        ? tags.filter((tag) => tag && tag.trim()).map((tag) => tag.trim())
        : [];
    }

    if (notes !== undefined) {
      updateFields.notes = notes;
    }

    const updatedContact: any = await this.queriesService.updateContact(
      contactId,
      workspaceId,
      updateFields,
    );

    if (!updatedContact) {
      throw new NotFoundException('Contact not found after update');
    }

    return {
      message: 'Contact updated successfully',
      contact: {
        id: updatedContact._id,
        name: updatedContact.name,
        phoneNumber: updatedContact.phoneNumber,
        email: updatedContact.email,
        company: updatedContact.company,
        tags: updatedContact.tags,
        notes: updatedContact.notes,
        createdBy: {
          id: updatedContact.createdBy._id,
          name: updatedContact.createdBy.name,
          email: updatedContact.createdBy.email,
        },
        createdAt: updatedContact.createdAt,
        updatedAt: updatedContact.updatedAt,
      },
    };
  }

  // Delete Contact
  async deleteContact(contactId: string, workspaceId: string) {
    const contact = await this.queriesService.deleteContact(
      contactId,
      workspaceId,
    );

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return {
      message: 'Contact deleted successfully',
    };
  }

  // Get Workspace Tags
  async getWorkspaceTags(workspaceId: string) {
    const tags = await this.queriesService.getWorkspaceTags(workspaceId);

    return {
      tags: tags.map((tag: any) => tag._id),
    };
  }
}
