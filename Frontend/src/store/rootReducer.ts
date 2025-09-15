import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slices/authSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
});
