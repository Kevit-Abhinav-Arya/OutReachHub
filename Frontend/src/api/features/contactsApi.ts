import apiClient from "../client";
import type {
  Contact,
  CreateContactDto,
  UpdateContactDto,
  GetContactsQuery,
} from "@/features/user-portal/contacts/types/contact.types";

// Backend response types (matching actual backend structure)
export interface ContactsListResponse {
  contacts: Contact[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

export interface ContactResponse {
  message: string;
  contact: Contact;
}

export const contactsApi = {
  // Get all contacts with pagination, search, and filtering
  getContacts: async (
    query: GetContactsQuery = {}
  ): Promise<ContactsListResponse> => {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());
    if (query.search) params.append("search", query.search);
    if (query.tags) params.append("tags", query.tags);

    const response = await apiClient.get(`/contacts?${params.toString()}`);
    return response.data;
  },

  // Get contact by ID
  getContactById: async (id: string): Promise<Contact> => {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data.contact;
  },

  // Create new contact
  createContact: async (contactData: CreateContactDto): Promise<Contact> => {
    const response = await apiClient.post("/contacts", contactData);
    return response.data.contact;
  },

  // Update existing contact
  updateContact: async (
    id: string,
    contactData: UpdateContactDto
  ): Promise<Contact> => {
    const response = await apiClient.put(`/contacts/${id}`, contactData);
    return response.data.contact;
  },

  // Delete contact
  deleteContact: async (id: string): Promise<void> => {
    await apiClient.delete(`/contacts/${id}`);
  },
};
