import * as React from "react";
import { MessageCircle, X } from "lucide-react";
import {
  V2Button,
  V2FloatingActionButton,
  V2Text,
} from "@/v2/shared/components/atoms";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { FLOATING_SURFACE_CLASS } from "@/v2/shared/ui/floating-surface";
import { cn } from "@/v2/shared/utils/cn";
import { useChatAutoScroll, useCloseOnEscape } from "./V2FloatingChat.hook";
import type { V2FloatingChatProps } from "./V2FloatingChat.type";

export const V2FloatingChatDesktop: React.FC<V2FloatingChatProps> = ({
  open,
  onOpenChange,
  title,
  subtitle,
  launcherLabel,
  launcherIcon,
  children,
  footer,
  scrollKey,
}) => {
  const { t } = useV2Translation();
  const close = React.useCallback(() => onOpenChange(false), [onOpenChange]);
  const bodyRef = useChatAutoScroll(open, scrollKey);
  useCloseOnEscape(open, close);

  if (!open) {
    return (
      <V2FloatingActionButton
        icon={launcherIcon ?? <MessageCircle className="h-5 w-5" />}
        label={launcherLabel}
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-6 z-40"
      />
    );
  }

  return (
    <section
      role="dialog"
      aria-label={title}
      data-testid="v2-floating-chat-panel"
      className={cn(
        "fixed bottom-6 right-6 z-40 flex flex-col overflow-hidden rounded-2xl border border-border text-foreground",
        "h-[min(38rem,calc(100dvh-6rem))] w-[min(26rem,calc(100vw-2rem))]",
        FLOATING_SURFACE_CLASS,
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <V2Text as="h2" variant="h4" className="truncate">
            {title}
          </V2Text>
          {subtitle && (
            <p className="truncate text-xs text-muted-fg">{subtitle}</p>
          )}
        </div>
        <V2Button
          variant="ghost"
          size="icon"
          aria-label={t("v2.common.close", "Đóng")}
          onClick={close}
        >
          <X aria-hidden className="h-4 w-4" />
        </V2Button>
      </header>
      <div
        ref={bodyRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3"
      >
        {children}
      </div>
      {footer && (
        <footer className="shrink-0 border-t border-border p-3">
          {footer}
        </footer>
      )}
    </section>
  );
};
V2FloatingChatDesktop.displayName = "V2FloatingChatDesktop";
