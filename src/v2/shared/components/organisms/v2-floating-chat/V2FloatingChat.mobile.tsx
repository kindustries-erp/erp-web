import * as React from "react";
import { MessageCircle } from "lucide-react";
import { V2FloatingActionButton } from "@/v2/shared/components/atoms";
import { V2BottomSheet } from "@/v2/shared/components/molecules/v2-bottom-sheet";
import { useChatAutoScroll } from "./V2FloatingChat.hook";
import type { V2FloatingChatProps } from "./V2FloatingChat.type";

export const V2FloatingChatMobile: React.FC<V2FloatingChatProps> = ({
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
  const bodyRef = useChatAutoScroll(open, scrollKey);

  return (
    <>
      {!open && (
        <V2FloatingActionButton
          icon={launcherIcon ?? <MessageCircle className="h-5 w-5" />}
          label={launcherLabel}
          onClick={() => onOpenChange(true)}
          // Nằm trên thanh điều hướng dưới và vùng an toàn của máy
          className="fixed right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] z-40"
        />
      )}
      <V2BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        subtitle={subtitle}
        footer={footer}
        maxHeightClass="h-[88dvh] max-h-[88dvh]"
        bodyClassName="p-0"
      >
        <div
          ref={bodyRef}
          data-testid="v2-floating-chat-sheet-body"
          className="flex h-full flex-col gap-3 overflow-y-auto p-3"
        >
          {children}
        </div>
      </V2BottomSheet>
    </>
  );
};
V2FloatingChatMobile.displayName = "V2FloatingChatMobile";
