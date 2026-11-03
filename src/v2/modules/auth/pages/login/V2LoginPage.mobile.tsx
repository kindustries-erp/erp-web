import * as React from "react";
import { V2AuthLocaleToggle } from "../../components/atoms/v2-auth-locale-toggle/V2AuthLocaleToggle";
import { V2LoginCard } from "../../components/organisms/v2-login-card/V2LoginCard";

export interface V2LoginPageMobileProps {
  onSuccess?: () => void;
}

export const V2LoginPageMobile: React.FC<V2LoginPageMobileProps> = ({
  onSuccess,
}) => {
  return (
    <div
      data-testid="v2-login-page-mobile"
      className="flex min-h-screen w-full flex-col justify-between bg-background px-4 py-6"
    >
      {/* Top bar with language toggle */}
      <header className="flex w-full items-center justify-end pb-4">
        <V2AuthLocaleToggle />
      </header>

      {/* Main card */}
      <main className="my-auto flex w-full justify-center">
        <V2LoginCard
          onSuccess={onSuccess}
          className="p-6 shadow-md dark:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.4)]"
        />
      </main>

      {/* Mobile footer spacing */}
      <footer className="h-6" aria-hidden="true" />
    </div>
  );
};

V2LoginPageMobile.displayName = "V2LoginPageMobile";
