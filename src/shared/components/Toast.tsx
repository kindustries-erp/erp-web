import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useUIStore } from "@/core/config/uiStore";
import { cn } from "@/shared/utils";

export function Toast() {
  const {
    toastTitle,
    toastDescription,
    toastVariant,
    toastVisible,
    hideToast,
  } = useUIStore();
  const isError = toastVariant === "destructive";
  const isSuccess = toastVariant === "success";

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={3800}>
      <ToastPrimitive.Root
        open={toastVisible}
        onOpenChange={(open) => {
          if (!open) hideToast();
        }}
        className={cn(
          "toast-root fixed right-5 top-5 z-[999] grid w-[360px] max-w-[calc(100vw-32px)] grid-cols-[auto_1fr_auto] items-start gap-3 rounded-lg border bg-surface px-4 py-3 text-foreground shadow-lg",
          isSuccess && "border-approve-bg bg-approve-bg text-approve-fg",
          isError && "border-[#f3b7b7] bg-[#fde8e8] text-[#a31919]",
        )}
      >
        <div className="pt-[1px]">
          {isError ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          {toastTitle && (
            <ToastPrimitive.Title className="text-sm font-semibold leading-5">
              {toastTitle}
            </ToastPrimitive.Title>
          )}
          {toastDescription && (
            <ToastPrimitive.Description className="mt-1 text-xs leading-5 opacity-90">
              {toastDescription}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close className="rounded-md p-1 opacity-70 hover:opacity-100">
          <X className="h-3.5 w-3.5" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed right-0 top-0 z-[999] m-0 flex w-auto list-none flex-col gap-2 p-0 outline-none" />
    </ToastPrimitive.Provider>
  );
}
