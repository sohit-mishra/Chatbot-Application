import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { NhostProvider } from "@nhost/react";
import { ApolloProvider } from "@apollo/client";
import App from "./App.tsx";
import nhost from "./lib/nhostClient.ts";
import { apolloClient } from "./lib/apolloClient.ts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NhostProvider nhost={nhost}>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </NhostProvider>
  </StrictMode>
);
