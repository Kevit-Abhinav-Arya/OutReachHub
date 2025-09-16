export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  tags: string[];
  notes?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactDisplay {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
  notes?: string;
}

export interface CreateContactDto {
  name: string;
  phoneNumber: string;
  email: string;
  company: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateContactDto {
  name?: string;
  phoneNumber?: string;
  email?: string;
  company?: string;
  tags?: string[];
  notes?: string;
}

export interface GetContactsQuery {
  page?: number;
  limit?: number;
  search?: string;
  tags?: string;
}

export interface ContactCardProps {
  contact: ContactDisplay;
  onAction: (contact: ContactDisplay, action: "view" | "edit" | "delete") => void;
  canEdit?: boolean;
}

export interface ContactModalProps {
  contact?: ContactDisplay;
  type: "view" | "edit" | "delete" | "add";
  onClose: () => void;
  onSave?: (contact: CreateContactDto | UpdateContactDto) => void;
  onDelete?: (contactId: string) => void;
}

export const contactToDisplay = (contact: Contact): ContactDisplay => {
  const nameParts = contact.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    id: contact.id,
    firstName,
    lastName,
    phone: contact.phoneNumber,
    email: contact.email,
    company: contact.company,
    tags: contact.tags,
    notes: contact.notes,
  };
};

export const displayToCreateDto = (display: Partial<ContactDisplay>): CreateContactDto => {
  const name = `${display.firstName || ''} ${display.lastName || ''}`.trim();
  
  return {
    name,
    phoneNumber: display.phone || '',
    email: display.email || '',
    company: display.company || '',
    tags: display.tags || [],
    notes: display.notes,
  };
};

export const displayToUpdateDto = (display: Partial<ContactDisplay>): UpdateContactDto => {
  const dto: UpdateContactDto = {};
  
  if (display.firstName !== undefined || display.lastName !== undefined) {
    dto.name = `${display.firstName || ''} ${display.lastName || ''}`.trim();
  }
  if (display.phone !== undefined) dto.phoneNumber = display.phone;
  if (display.email !== undefined) dto.email = display.email;
  if (display.company !== undefined) dto.company = display.company;
  if (display.tags !== undefined) dto.tags = display.tags;
  if (display.notes !== undefined) dto.notes = display.notes;
  
  return dto;
};
