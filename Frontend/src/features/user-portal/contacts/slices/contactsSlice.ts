import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { contactsApi } from "@/api/features/contactsApi";
import type {
  Contact,
  ContactDisplay,
  CreateContactDto,
  UpdateContactDto,
  GetContactsQuery,
} from "../types/contact.types";
import { contactToDisplay } from "../types/contact.types";

// Async thunks for contacts API calls
export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async (query: GetContactsQuery = {}, { rejectWithValue }) => {
    try {
      const response = await contactsApi.getContacts(query);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contacts"
      );
    }
  }
);

export const fetchContactById = createAsyncThunk(
  "contacts/fetchContactById",
  async (id: string, { rejectWithValue }) => {
    try {
      const contact = await contactsApi.getContactById(id);
      return contact;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch contact"
      );
    }
  }
);

export const createContact = createAsyncThunk(
  "contacts/createContact",
  async (contactData: CreateContactDto, { rejectWithValue }) => {
    try {
      const contact = await contactsApi.createContact(contactData);
      return contact;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create contact"
      );
    }
  }
);

export const updateContact = createAsyncThunk(
  "contacts/updateContact",
  async (
    { id, contactData }: { id: string; contactData: UpdateContactDto },
    { rejectWithValue }
  ) => {
    try {
      const contact = await contactsApi.updateContact(id, contactData);
      return contact;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update contact"
      );
    }
  }
);

export const deleteContact = createAsyncThunk(
  "contacts/deleteContact",
  async (id: string, { rejectWithValue }) => {
    try {
      await contactsApi.deleteContact(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete contact"
      );
    }
  }
);

// Contacts state interface
interface ContactsState {
  contacts: ContactDisplay[];
  selectedContact: ContactDisplay | null;

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Loading states
  loading: {
    list: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
    fetch: boolean;
  };

  // Error states
  error: {
    list: string | null;
    create: string | null;
    update: string | null;
    delete: string | null;
    fetch: string | null;
  };
}

const initialState: ContactsState = {
  contacts: [],
  selectedContact: null,

  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loading: {
    list: false,
    create: false,
    update: false,
    delete: false,
    fetch: false,
  },

  error: {
    list: null,
    create: null,
    update: null,
    delete: null,
    fetch: null,
  },
};

const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = {
        list: null,
        create: null,
        update: null,
        delete: null,
        fetch: null,
      };
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload;
    },

    setSelectedContact: (
      state,
      action: PayloadAction<ContactDisplay | null>
    ) => {
      state.selectedContact = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Fetch contacts
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading.list = true;
        state.error.list = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading.list = false;
        state.contacts = action.payload.contacts.map(contactToDisplay);
        state.pagination = {
          page: action.payload.pagination.currentPage,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.totalItems,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading.list = false;
        state.error.list = action.payload as string;
      });

    // Fetch contact by ID
    builder
      .addCase(fetchContactById.pending, (state) => {
        state.loading.fetch = true;
        state.error.fetch = null;
      })
      .addCase(
        fetchContactById.fulfilled,
        (state, action: PayloadAction<Contact>) => {
          state.loading.fetch = false;
          state.selectedContact = contactToDisplay(action.payload);
        }
      )
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error.fetch = action.payload as string;
      });

    // Create contact
    builder
      .addCase(createContact.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
      })
      .addCase(
        createContact.fulfilled,
        (state, action: PayloadAction<Contact>) => {
          state.loading.create = false;
          const newContactDisplay = contactToDisplay(action.payload);
          state.contacts.unshift(newContactDisplay);
          state.pagination.total += 1;
        }
      )
      .addCase(createContact.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload as string;
      });

    // Update contact
    builder
      .addCase(updateContact.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(
        updateContact.fulfilled,
        (state, action: PayloadAction<Contact>) => {
          state.loading.update = false;
          const updatedContactDisplay = contactToDisplay(action.payload);
          const index = state.contacts.findIndex(
            (contact) => contact.id === updatedContactDisplay.id
          );
          if (index !== -1) {
            state.contacts[index] = updatedContactDisplay;
          }
          if (state.selectedContact?.id === updatedContactDisplay.id) {
            state.selectedContact = updatedContactDisplay;
          }
        }
      )
      .addCase(updateContact.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload as string;
      });

    // Delete contact
    builder
      .addCase(deleteContact.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(
        deleteContact.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading.delete = false;
          state.contacts = state.contacts.filter(
            (contact) => contact.id !== action.payload
          );
          state.pagination.total -= 1;
          if (state.selectedContact?.id === action.payload) {
            state.selectedContact = null;
          }
        }
      )
      .addCase(deleteContact.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload as string;
      });
  },
});

export const { clearErrors, setPage, setLimit, setSelectedContact } =
  contactsSlice.actions;

export default contactsSlice.reducer;
