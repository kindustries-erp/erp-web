import { useCallback, useState } from "react";
import type {
  LinkedFieldState,
  V2LinkedFieldProps,
} from "./V2LinkedField.type";

type HookInput = Pick<
  V2LinkedFieldProps,
  | "options"
  | "getSourceText"
  | "fkValue"
  | "localValue"
  | "sourceValue"
  | "overridden"
  | "onFkChange"
  | "onLocalChange"
  | "onRefresh"
>;

const norm = (v: string | null | undefined): string => (v ?? "").trim();

/**
 * Logic của field liên kết FK + giá trị song song:
 * - chọn FK → điền giá trị nguồn của option (mặc định là nhãn) vào ô song song (giá trị nguồn mới, chưa lưu);
 * - sửa ô song song → chỉ đổi giá trị cục bộ, không đụng FK/nguồn;
 * - "đã chỉnh" khi giá trị khác nguồn; khôi phục = đặt lại đúng giá trị nguồn.
 * Server là nơi lập snapshot khi lưu; hook chỉ phản ánh trạng thái để người dùng thấy ngay.
 */
export function useLinkedField(input: HookInput): LinkedFieldState {
  const {
    options,
    getSourceText,
    fkValue,
    localValue,
    sourceValue,
    overridden: persistedOverridden,
    onFkChange,
    onLocalChange,
    onRefresh,
  } = input;
  // Nguồn của lần chọn trong form hiện tại (chưa lưu): thắng snapshot cũ của server.
  const [pickedSource, setPickedSource] = useState<string | null>(null);
  const [isRefreshing, setRefreshing] = useState(false);

  // Chưa có snapshot (phiếu cũ): lấy nguồn từ option của FK đang chọn để vẫn nhận ra field đã sửa.
  const fkOption = fkValue
    ? options.find((o) => o.value === fkValue)
    : undefined;
  const optionSource = fkOption
    ? getSourceText
      ? getSourceText(fkOption)
      : fkOption.label
    : null;
  const sourceText = pickedSource ?? sourceValue ?? optionSource;
  const overridden =
    sourceText !== null
      ? norm(localValue) !== norm(sourceText)
      : Boolean(persistedOverridden);

  const select = useCallback(
    (next: string | null) => {
      onFkChange(next);
      const option = next ? options.find((o) => o.value === next) : undefined;
      if (option) {
        const text = getSourceText ? getSourceText(option) : option.label;
        setPickedSource(text);
        onLocalChange(text);
      } else {
        // Bỏ chọn FK: giữ nguyên chữ đã nhập, không còn nguồn để so sánh.
        setPickedSource(null);
      }
    },
    [getSourceText, onFkChange, onLocalChange, options],
  );

  const revert = useCallback(() => {
    if (sourceText !== null) onLocalChange(sourceText);
  }, [onLocalChange, sourceText]);

  const refresh = useCallback(() => {
    if (!onRefresh || isRefreshing) return;
    setRefreshing(true);
    // Chỉ bỏ nguồn vừa chọn khi làm mới thành công; lỗi thì giữ nguyên và để onRefresh tự báo lỗi.
    // Executor chạy đồng bộ: onRefresh được gọi ngay khi bấm, lỗi đồng bộ cũng thành rejection.
    new Promise((resolve) => resolve(onRefresh()))
      .then(() => setPickedSource(null))
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }, [isRefreshing, onRefresh]);

  return {
    sourceText,
    overridden,
    canRevert: overridden && sourceText !== null,
    canRefresh: Boolean(fkValue && onRefresh),
    isRefreshing,
    select,
    edit: onLocalChange,
    revert,
    refresh,
  };
}
