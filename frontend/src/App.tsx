import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { Provider } from "react-redux";
import { store, persistor } from "./store";
import { DialogProvider } from "./utils/confirmDialog";
import { Toaster } from "react-hot-toast";
import { PersistGate } from "redux-persist/integration/react";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}></PersistGate>
      <DialogProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 3000 }}
        />
        <AppRoutes />
      </DialogProvider>
    </Provider>
  );
};

export default App; 
