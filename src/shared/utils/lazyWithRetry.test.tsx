import React, { Suspense } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { lazyWithRetry } from "./lazyWithRetry";

describe("lazyWithRetry", () => {
  const RETRY_KEY = "erp_chunk_load_retried";

  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("successfully renders the component when factory resolves", async () => {
    const DummyComponent: React.FC = () => <div>Loaded Successfully</div>;
    const factory = vi.fn().mockResolvedValue({ default: DummyComponent });

    const LazyComp = lazyWithRetry(factory);

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComp />
      </Suspense>,
    );

    expect(await screen.findByText("Loaded Successfully")).toBeInTheDocument();
    expect(factory).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(RETRY_KEY)).toBeNull();
  });

  it("triggers window.location.reload when factory throws error on first attempt", async () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload: reloadMock },
    });

    const factory = vi
      .fn()
      .mockRejectedValue(
        new Error("Failed to fetch dynamically imported module"),
      );
    const LazyComp = lazyWithRetry(factory);

    render(
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComp />
      </Suspense>,
    );

    // Wait a tick for async lazy factory execution
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(factory).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(RETRY_KEY)).toBe("true");
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
