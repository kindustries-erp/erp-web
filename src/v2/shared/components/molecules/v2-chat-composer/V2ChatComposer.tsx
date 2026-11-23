import * as React from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import { V2Button } from "@/v2/shared/components/atoms";
import { validateFiles } from "@/v2/shared/components/molecules/v2-file-upload/V2FileUpload.helper";
import { cn } from "@/v2/shared/utils/cn";
import { V2_DRAWER_FOCUS_RING_CLASS } from "@/v2/shared/utils/v2FocusRing";
import type { V2ChatComposerProps } from "./V2ChatComposer.type";

/** Thanh soạn tin của khung chat: đính kèm một file và (tùy chọn) nhập chữ. */
export const V2ChatComposer: React.FC<V2ChatComposerProps> = ({
  onSend,
  onAttach,
  onReject,
  accept,
  maxSizeBytes,
  disabled = false,
  placeholder,
  attachLabel,
  sendLabel,
  className,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [text, setText] = React.useState("");

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    const { accepted, rejected } = validateFiles(files, {
      accept,
      maxSizeBytes,
      maxFiles: 1,
    });
    if (accepted.length > 0) onAttach?.(accepted);
    else if (rejected[0]) onReject?.(rejected[0].reason);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    onSend?.(value);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className={cn("flex items-center gap-2", className)}
    >
      {onAttach && (
        <>
          <V2Button
            type="button"
            variant={onSend ? "outline" : "primary"}
            size="lg"
            fullWidth={!onSend}
            disabled={disabled}
            aria-label={attachLabel}
            leftIcon={<Paperclip aria-hidden className="h-4 w-4" />}
            onClick={() => inputRef.current?.click()}
            className="min-h-11"
          >
            {onSend ? null : attachLabel}
          </V2Button>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={accept?.join(",")}
            disabled={disabled}
            onChange={handleFiles}
            data-testid="v2-chat-file-input"
          />
        </>
      )}
      {onSend && (
        <>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={placeholder}
            className={cn(
              "h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-base text-foreground sm:text-sm",
              V2_DRAWER_FOCUS_RING_CLASS,
            )}
          />
          <V2Button
            type="submit"
            size="lg"
            disabled={disabled || !text.trim()}
            aria-label={sendLabel}
            className="min-h-11"
          >
            <SendHorizontal aria-hidden className="h-4 w-4" />
          </V2Button>
        </>
      )}
    </form>
  );
};
V2ChatComposer.displayName = "V2ChatComposer";
