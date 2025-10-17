import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { authApi } from "./api/features/authApi";
import { clearAuth } from "./features/auth/slices/authSlice";
import "./index.css";
import "@fortawesome/fontawesome-free/css/all.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const verifyTokenBeforeStart = async () => {
  const token = localStorage.getItem("authToken");
  const authState = store.getState().auth;

  if (token && authState.isAuthenticated) {
    try {
      await authApi.verifyToken();
    } catch (error) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("persist:root");
      store.dispatch(clearAuth());
      console.log(error);
      await persistor.purge();
    }
  } else if (!token && authState.isAuthenticated) {
    store.dispatch(clearAuth());
  }
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        onBeforeLift={verifyTokenBeforeStart}
        loading={
          <div style={{ padding: "20px", textAlign: "center" }}>
            Verifying session...
          </div>
        }
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
