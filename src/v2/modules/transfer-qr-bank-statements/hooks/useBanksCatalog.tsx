import React, { useMemo, useState, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { V2Image } from "@/v2/shared/components/atoms";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  VIETQR_BANKS,
  type VietQrBank,
} from "@/v2/core/transfer-qr-core/domain/constants/vietQrBanks";
import { getBankLogoUrl, resolveBankLogoUrl } from "@/v2/core/transfer-qr-core";
import { banksCatalogApi } from "../api/banksCatalogApi";

export { resolveBankLogoUrl };

export interface UnifiedBank extends VietQrBank {
  logoUrl?: string | null;
}

export interface BankComboboxOption {
  value: string;
  label: string;
  description?: string;
  logoUrl?: string | null;
  icon?: React.ReactNode;
}

const STATIC_FALLBACK_BANKS: readonly UnifiedBank[] = VIETQR_BANKS.map((b) => ({
  ...b,
  logoUrl: getBankLogoUrl(b.code),
}));

export function useBanksCatalog() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["banks-catalog-infinite", debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      banksCatalogApi.getBanks({
        page: pageParam,
        pageSize: 20,
        search: debouncedSearch || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage?.pagination?.next ?? undefined,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const banks: readonly UnifiedBank[] = useMemo(() => {
    const fetched = data?.pages?.flatMap((p) => p.items) || [];
    if (fetched.length > 0) {
      return fetched.map((item) => ({
        code: item.code,
        shortName: item.shortName,
        name: item.name,
        bin: item.bin,
        aliases: item.aliases || [],
        logoUrl: resolveBankLogoUrl(item.code, item.logoUrl),
      }));
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return STATIC_FALLBACK_BANKS.filter(
        (b) =>
          b.code.toLowerCase().includes(q) ||
          b.shortName.toLowerCase().includes(q) ||
          b.name.toLowerCase().includes(q) ||
          b.bin.includes(q),
      );
    }
    return STATIC_FALLBACK_BANKS;
  }, [data, debouncedSearch]);

  const bankOptions: BankComboboxOption[] = useMemo(
    () =>
      banks.map((b) => ({
        value: b.bin,
        label: `${b.code} - ${b.shortName}`,
        description: b.name,
        logoUrl: b.logoUrl,
        icon: (
          <V2Image
            src={b.logoUrl || getBankLogoUrl(b.code)}
            alt={b.code}
            className="h-4 w-4 object-contain rounded-sm"
            loading="lazy"
          />
        ),
      })),
    [banks],
  );

  const handleScrollBottom = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const findBank = useMemo(() => {
    return (binOrCode?: string | null): UnifiedBank | undefined => {
      if (!binOrCode) return undefined;
      const normalized = binOrCode.trim().toUpperCase();
      const match = banks.find(
        (b) =>
          b.bin === binOrCode ||
          b.code.toUpperCase() === normalized ||
          b.aliases.some((a) => a.toUpperCase() === normalized),
      );
      if (match) return match;
      return STATIC_FALLBACK_BANKS.find(
        (b) =>
          b.bin === binOrCode ||
          b.code.toUpperCase() === normalized ||
          b.aliases.some((a) => a.toUpperCase() === normalized),
      );
    };
  }, [banks]);

  return {
    banks,
    bankOptions,
    findBank,
    search,
    onSearchChange: setSearch,
    onScrollBottom: handleScrollBottom,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    loading: isLoading || isFetchingNextPage,
    error,
  };
}
