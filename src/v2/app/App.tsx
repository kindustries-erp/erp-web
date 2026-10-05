import * as React from "react";
import "@/v2/shared/styles/index.css";
import { AppProviders } from "./providers";
import { V2RouterView } from "./router";

export const V2App: React.FC = () => {
  return (
    <AppProviders>
      <V2RouterView />
    </AppProviders>
  );
};

export default V2App;
