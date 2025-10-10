import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";
import analyticsReducer from "../features/user-portal/dashboard/slices/analyticsSlice";
import contactsReducer from "../features/user-portal/contacts/slices/contactsSlice";
import messageTemplatesReducer from "../features/user-portal/message-templates/slices/messageTemplatesSlice";
import campaignsReducer from "../features/user-portal/campaigns/slices/campaignsSlice";
import workspacesReducer from "../features/admin-portal/slices/workspacesSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  analytics: analyticsReducer,
  contacts: contactsReducer,
  messageTemplates: messageTemplatesReducer,
  campaigns: campaignsReducer,
  workspaces: workspacesReducer,
});
