import { useState, useRef } from "react";

/**
 * useDebounceFilter — quản lý state filter có debounce (search, amount range).
 * Tránh gọi API mỗi keystroke, chờ người dùng ngừng gõ 400ms.
 */
export function useDebounceInput(delay = 400) {
  const timer = useRef<ReturnType<typeof setTimeout>>();

  function debounce(fn: () => void) {
    clearTimeout(timer.current);
    timer.current = setTimeout(fn, delay);
  }

  function cancel() {
    clearTimeout(timer.current);
  }

  return { debounce, cancel };
}

/**
 * useSearchFilter — quản lý state search có debounce cho table.
 */
export function useSearchFilter() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { debounce } = useDebounceInput(400);

  function handleSearchInput(v: string, onPageReset?: () => void) {
    setSearchInput(v);
    if (!v) {
      setSearch("");
      onPageReset?.();
      return;
    }
    debounce(() => {
      setSearch(v);
      onPageReset?.();
    });
  }

  return { searchInput, search, handleSearchInput };
}

/**
 * useAmountRangeFilter — quản lý state lọc theo khoảng tiền (min–max) có debounce.
 */
export function useAmountRangeFilter() {
  const [amountMinInput, setAmountMinInput] = useState("");
  const [amountMaxInput, setAmountMaxInput] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const { debounce } = useDebounceInput(400);

  function handleAmountRangeInput(kind: "min" | "max", value: string, onPageReset?: () => void) {
    if (kind === "min") setAmountMinInput(value);
    else setAmountMaxInput(value);
    debounce(() => {
      if (kind === "min") setAmountMin(value);
      else setAmountMax(value);
      onPageReset?.();
    });
  }

  function resetAmounts() {
    setAmountMinInput("");
    setAmountMaxInput("");
    setAmountMin("");
    setAmountMax("");
  }

  return { amountMinInput, amountMaxInput, amountMin, amountMax, handleAmountRangeInput, resetAmounts };
}
