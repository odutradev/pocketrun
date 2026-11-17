import "react-toastify/dist/ReactToastify.css";
import { createRoot } from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { StrictMode } from "react";

import AppProviders from "@components/appProviders";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>
  );
}
