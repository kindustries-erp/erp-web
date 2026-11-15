import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import { Popover, PopoverContent, PopoverTrigger } from "@/v2/shared/ui";

type T = (key: string, fallback: string) => string;

export interface ProcurementLinkedDoc {
  id: string;
  label: string;
}

export interface ProcurementLinkedDocCellProps {
  /** Chứng từ liên kết, đã lọc sẵn (không có thì hiện "—") */
  docs: ProcurementLinkedDoc[];
  t: T;
  /** Mở chứng từ liên kết trong drawer; thiếu thì chỉ hiện chữ và copy */
  onOpen?: (id: string) => void;
}

/**
 * Ô liên kết PR ↔ PO: chứng từ đầu có copy và icon mở drawer, các chứng từ còn lại gom vào chip "+N".
 */
export function ProcurementLinkedDocCell({
  docs,
  t,
  onOpen,
}: ProcurementLinkedDocCellProps) {
  if (docs.length === 0) {
    return (
      <V2Text as="span" variant="body-sm" color="muted">
        —
      </V2Text>
    );
  }

  const [first, ...rest] = docs;
  const openFirst = onOpen ? () => onOpen(first.id) : undefined;

  return (
    <div className="flex min-w-0 items-center gap-1">
      <div className="min-w-0 flex-1">
        <V2TableText
          text={first.label}
          enableCopy
          onTextClick={openFirst}
          onDrawerClick={openFirst}
        />
      </div>
      {rest.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <V2Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-5 shrink-0 px-1.5"
              aria-label={t(
                "v2.procurement.columns.linkedMoreAria",
                "Xem thêm chứng từ liên quan",
              )}
            >
              +{rest.length}
            </V2Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-2">
            <V2Text
              as="p"
              variant="caption"
              color="muted"
              className="px-1 pb-1"
            >
              {t("v2.procurement.columns.linkedMore", "Chứng từ liên quan")}
            </V2Text>
            <ul className="flex flex-col">
              {rest.map((doc) => (
                <li key={doc.id}>
                  <V2Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onOpen ? () => onOpen(doc.id) : undefined}
                  >
                    {doc.label}
                  </V2Button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
