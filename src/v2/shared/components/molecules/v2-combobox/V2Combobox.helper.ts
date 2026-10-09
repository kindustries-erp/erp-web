import type { V2ComboboxOption } from "./V2Combobox.type";

/** Bỏ dấu tiếng Việt và hạ chữ thường để tìm không phân biệt dấu */
export const normalizeSearchText = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

export const filterV2ComboboxOptions = (
  options: V2ComboboxOption[],
  query: string,
): V2ComboboxOption[] => {
  const needle = normalizeSearchText(query);
  if (!needle) return options;
  return options.filter((option) =>
    normalizeSearchText(`${option.label} ${option.description ?? ""}`).includes(
      needle,
    ),
  );
};

/** Vị trí kế tiếp không bị vô hiệu hóa theo `step` (+1/-1), dừng ở hai đầu */
export const nextEnabledIndex = (
  options: V2ComboboxOption[],
  from: number,
  step: 1 | -1,
): number => {
  for (let i = from + step; i >= 0 && i < options.length; i += step) {
    if (!options[i]?.disabled) return i;
  }
  return from;
};
