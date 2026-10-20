import * as React from "react";
import { Sheet, SheetContent, SheetTitle } from "@/v2/shared/ui/sheet";
import type { V2DrawerSheetProps } from "./V2DrawerSheet.type";

/** Vỏ Sheet dùng chung cho drawer: nối Esc/bấm nền vào onRequestClose và có tiêu đề sr-only */
export const V2DrawerSheet: React.FC<V2DrawerSheetProps> = ({
  open,
  onRequestClose,
  side,
  title,
  className,
  style,
  overlayStyle,
  children,
}) => (
  <Sheet open={open} onOpenChange={(v) => (!v ? onRequestClose() : undefined)}>
    <SheetContent
      side={side}
      hideCloseButton
      className={className}
      style={style}
      overlayStyle={overlayStyle}
    >
      <SheetTitle className="sr-only">{title}</SheetTitle>
      {children}
    </SheetContent>
  </Sheet>
);
