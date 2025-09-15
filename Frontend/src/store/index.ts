import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, createTransform } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { rootReducer } from "./rootReducer";

const authTransform = createTransform(
  (inboundState) => {
    return inboundState;
  },
  (outboundState: any) => {
    const token = localStorage.getItem("authToken");

    if (outboundState && outboundState.isAuthenticated && !token) {
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresWorkspaceSelection: false,
        availableWorkspaces: [],
        tempToken: null,
      };
    }
    if (token && (!outboundState || !outboundState.isAuthenticated)) {
      localStorage.removeItem("authToken");
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        requiresWorkspaceSelection: false,
        availableWorkspaces: [],
        tempToken: null,
      };
    }

    return outboundState;
  },
  { whitelist: ["auth"] }
);

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [authTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer as any);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

if (typeof window !== "undefined") {
  (window as any).__store__ = store;
  (window as any).__persistor__ = persistor;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
