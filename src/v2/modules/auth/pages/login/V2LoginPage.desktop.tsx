import * as React from "react";
import { V2AuthLocaleToggle } from "../../components/atoms/v2-auth-locale-toggle/V2AuthLocaleToggle";
import { V2LoginCard } from "../../components/organisms/v2-login-card/V2LoginCard";

export interface V2LoginPageDesktopProps {
  onSuccess?: () => void;
}

export const V2LoginPageDesktop: React.FC<V2LoginPageDesktopProps> = ({
  onSuccess,
}) => {
  return (
    <div
      data-testid="v2-login-page-desktop"
      className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-12"
    >
      {/* Top right language toggle */}
      <div className="absolute right-6 top-6 z-10">
        <V2AuthLocaleToggle />
      </div>

      {/* Center login card */}
      <main className="relative z-10 flex w-full justify-center">
        <V2LoginCard onSuccess={onSuccess} />
      </main>
    </div>
  );
};

V2LoginPageDesktop.displayName = "V2LoginPageDesktop";
