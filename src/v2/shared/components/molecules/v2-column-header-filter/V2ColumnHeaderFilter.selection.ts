import {
  V2_ALL_MATCHING_VALUE,
  V2_BLANK_VALUE,
} from "@/v2/shared/types/v2-table";
import type { V2FilterOption } from "@/v2/shared/types/v2-table";
import { formatCompositeFilterValue } from "@/v2/shared/utils/v2TableFormat";

export const isAllMatching = (selected: string[]): boolean =>
  selected[0] === V2_ALL_MATCHING_VALUE;

export const toggleValue = (selected: string[], value: string): string[] => {
  if (isAllMatching(selected)) return [value];
  return selected.includes(value)
    ? selected.filter((item) => item !== value)
    : [...selected, value];
};

export const toggleAllMatching = (
  selected: string[],
  search: string,
): string[] => (isAllMatching(selected) ? [] : [V2_ALL_MATCHING_VALUE, search]);

export const syncAllMatching = (
  selected: string[],
  search: string,
): string[] | null => {
  if (!isAllMatching(selected)) return null;
  if (search.trim() === "") return [];
  return selected[1] === search ? null : [V2_ALL_MATCHING_VALUE, search];
};

export const areAllVisibleSelected = (
  selected: string[],
  options: V2FilterOption[],
): boolean =>
  !isAllMatching(selected) &&
  options.length > 0 &&
  options.every((option) => selected.includes(option.value));

export const toggleAllVisible = (
  selected: string[],
  options: V2FilterOption[],
): string[] =>
  areAllVisibleSelected(selected, options)
    ? []
    : options.map((option) => option.value);

export const hasSameValues = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export const resolveOptionLabel = (
  option: V2FilterOption,
  blankLabel: string,
  formatOptionLabel?: (value: string) => string,
): string => {
  if (option.value === V2_BLANK_VALUE) return blankLabel;
  if (formatOptionLabel) return formatOptionLabel(option.value);
  return formatCompositeFilterValue(option.label || option.value);
};
