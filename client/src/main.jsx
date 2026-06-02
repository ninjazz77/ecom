import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

let persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            className:
              "!rounded-2xl !border !border-white/10 !bg-[rgba(15,15,20,0.95)] !text-white !shadow-[0_20px_60px_rgba(0,0,0,0.5)] !backdrop-blur-xl",
            style: { fontFamily: "Inter, sans-serif" },
          }}
        />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
