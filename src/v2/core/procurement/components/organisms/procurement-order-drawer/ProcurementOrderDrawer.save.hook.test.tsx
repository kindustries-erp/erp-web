import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { emptyOrderForm } from "../../../form/procurementOrder.form";
import type { ProcurementApi } from "../../../procurement.types";
import { useProcurementOrderSave } from "./ProcurementOrderDrawer.save.hook";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const makeApi = (withSaveAndSubmit: boolean) =>
  ({
    create: vi.fn().mockResolvedValue({ id: "n1" }),
    updateHeader: vi.fn().mockResolvedValue({}),
    replaceLines: vi.fn().mockResolvedValue({}),
    transition: vi.fn().mockResolvedValue({}),
    saveAndSubmit: withSaveAndSubmit
      ? vi.fn().mockResolvedValue({ id: "s1" })
      : undefined,
  }) as unknown as ProcurementApi<unknown>;

const setup = (api: ProcurementApi<unknown>, documentId: string | null) =>
  renderHook(
    () =>
      useProcurementOrderSave({
        api,
        queryKey: "po",
        documentId,
        branchOptional: true,
        form: { ...emptyOrderForm("2026-11-11"), supplierName: "NCC A" },
        validate: () => true,
        onClose: vi.fn(),
        onSaved: vi.fn(),
      }),
    { wrapper },
  );

describe("useProcurementOrderSave.confirmSubmit", () => {
  it("họ có saveAndSubmit: tạo mới gọi đúng MỘT request, không create + transition", async () => {
    const api = makeApi(true);
    const { result } = setup(api, null);
    result.current.confirmSubmit();
    await waitFor(() => expect(api.saveAndSubmit).toHaveBeenCalledTimes(1));
    expect(api.saveAndSubmit).toHaveBeenCalledWith(null, expect.any(Object));
    expect(api.create).not.toHaveBeenCalled();
    expect(api.transition).not.toHaveBeenCalled();
  });

  it("sửa nháp: saveAndSubmit(id) kèm đầu đơn + dòng", async () => {
    const api = makeApi(true);
    const { result } = setup(api, "o9");
    result.current.confirmSubmit();
    await waitFor(() => expect(api.saveAndSubmit).toHaveBeenCalledTimes(1));
    const [id, body] = (api.saveAndSubmit as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(id).toBe("o9");
    expect(body).toEqual(expect.objectContaining({ lines: expect.any(Array) }));
    expect(api.updateHeader).not.toHaveBeenCalled();
  });

  it("họ không có saveAndSubmit (ERP): giữ luồng lưu rồi chuyển trạng thái", async () => {
    const api = makeApi(false);
    const { result } = setup(api, null);
    result.current.confirmSubmit();
    await waitFor(() =>
      expect(api.transition).toHaveBeenCalledWith("n1", "submit"),
    );
    expect(api.create).toHaveBeenCalledTimes(1);
  });
});
