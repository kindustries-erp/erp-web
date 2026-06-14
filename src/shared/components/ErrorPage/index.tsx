import type { ReactNode } from "react";
import { useDict } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { BtnPrimary } from "@/shared/components/BtnPrimary";

interface ErrorPageProps {
  code: "404" | "403";
  children?: ReactNode;
}

export function ErrorPage({ code, children }: ErrorPageProps) {
  const dict = useDict();
  const { navigate } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="text-9xl font-bold text-muted-foreground mb-4">
        {code}
      </div>
      <h1 className="text-2xl font-semibold mb-2">
        {dict.errorPages[code].title}
      </h1>
      <p className="text-muted-foreground mb-8">
        {dict.errorPages[code].description}
      </p>
      {children}
      <BtnPrimary onClick={() => navigate("purchasing")}>
        {dict.errorPages[code].backHome}
      </BtnPrimary>
    </div>
  );
}
