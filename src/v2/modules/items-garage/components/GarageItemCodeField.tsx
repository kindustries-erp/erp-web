import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { V2Input } from "@/v2/shared/components/atoms/v2-input";
import type { LineItemCodeFieldProps } from "@/v2/shared/context/LineItemCodeFieldContext";
import { listGarageItemOptions } from "../api/garageItemOptions";

const MIN_CHARS = 2;
const DEBOUNCE_MS = 250;

/**
 * Ô mã hàng có gợi ý từ danh mục garage. Vẫn gõ tự do được: mã chưa có sẽ được tạo khi lưu chứng từ.
 * Chọn đúng một gợi ý thì điền luôn tên và đơn vị.
 */
export function GarageItemCodeField({
  value,
  ariaLabel,
  placeholder,
  className,
  onPick,
}: LineItemCodeFieldProps) {
  const listId = React.useId();
  const [term, setTerm] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => setTerm(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const options = useQuery({
    queryKey: ["v2-items-garage", "options", term],
    queryFn: () => listGarageItemOptions(term),
    enabled: term.length >= MIN_CHARS,
    staleTime: 30_000,
    retry: false,
  });

  const handleChange = (next: string) => {
    const hit = options.data?.find(
      (o) => o.itemCode.toLowerCase() === next.trim().toLowerCase(),
    );
    onPick(
      hit
        ? {
            itemCode: hit.itemCode,
            itemName: hit.itemName,
            unit: hit.unit ?? undefined,
          }
        : { itemCode: next },
    );
  };

  return (
    <>
      <V2Input
        sizeVariant="xs"
        aria-label={ariaLabel}
        className={className}
        value={value}
        placeholder={placeholder}
        list={listId}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
      />
      <datalist id={listId}>
        {(options.data ?? []).map((o) => (
          <option key={o.itemCode} value={o.itemCode}>
            {o.itemName}
          </option>
        ))}
      </datalist>
    </>
  );
}
