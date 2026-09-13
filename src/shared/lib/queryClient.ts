import { QueryClient } from "@tanstack/react-query";
import { DEFAULT_STALE_TIME } from "./queryKeys";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_STALE_TIME,
    },
    mutations: {
      retry: 0,
    },
  },
});
