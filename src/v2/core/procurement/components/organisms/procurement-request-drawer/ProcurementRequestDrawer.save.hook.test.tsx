import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { emptyRequestForm } from "../../../form/procurementRequest.form";
import type {
  ProcurementApi,
  ProcurementRequestDetail,
} from "../../../procurement.types";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import { ProcurementRequestDrawer } from "./ProcurementRequestDrawer";
import { useProcurementRequestSave } from "./ProcurementRequestDrawer.save.hook";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);

const makeApi = () =>
  ({
    create: vi.fn().mockResolvedValue({ id: "n1" }),
    updateHeader: vi.fn().mockResolvedValue({}),
    replaceLines: vi.fn().mockResolvedValue({}),
    saveAndSubmit: vi.fn().mockResolvedValue({ id: "s1" }),
  }) as unknown as ProcurementApi<unknown>;

const setup = (creating: boolean, api: ProcurementApi<unknown>) =>
  renderHook(
    () =>
      useProcurementRequestSave({
        api,
        queryKey: "pr",
        documentId: creating ? null : "r9",
        creating,
        form: emptyRequestForm("2026-11-11"),
        branchOptional: true,
        onClose: vi.fn(),
        onUpdated: vi.fn(),
        onSaved: vi.fn(),
      }),
    { wrapper },
  );

describe("useProcurementRequestSave", () => {
  it("Tạo mới: đúng MỘT request saveAndSubmit(null) kèm approverId, không gọi create", async () => {
    const api = makeApi();
    const { result } = setup(true, api);
    result.current.mutate({ submit: true, approverId: "ap1" });
    await waitFor(() => expect(api.saveAndSubmit).toHaveBeenCalledTimes(1));
    expect(api.saveAndSubmit).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ approverId: "ap1", lines: expect.any(Array) }),
    );
    expect(api.create).not.toHaveBeenCalled();
  });

  it("Cập nhật: saveAndSubmit(id) với đầu đề + dòng, không gọi updateHeader/replaceLines riêng", async () => {
    const api = makeApi();
    const { result } = setup(false, api);
    result.current.mutate({ submit: true });
    await waitFor(() => expect(api.saveAndSubmit).toHaveBeenCalledTimes(1));
    const [id, body] = (api.saveAndSubmit as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(id).toBe("r9");
    expect(body).toEqual(expect.objectContaining({ lines: expect.any(Array) }));
    expect(body).not.toHaveProperty("approverId");
    expect(api.updateHeader).not.toHaveBeenCalled();
    expect(api.replaceLines).not.toHaveBeenCalled();
  });

  it("Lưu nháp: giữ luồng create, không gọi saveAndSubmit", async () => {
    const api = makeApi();
    const { result } = setup(true, api);
    result.current.mutate(undefined);
    await waitFor(() => expect(api.create).toHaveBeenCalledTimes(1));
    expect(api.saveAndSubmit).not.toHaveBeenCalled();
  });
});

describe("ProcurementRequestDrawer submitFromDrawer", () => {
  it("PR nháp ở chế độ xem không còn nút Gửi duyệt riêng", async () => {
    const detail = {
      id: "r1",
      requestNo: "PR-1",
      requestDate: "2026-11-05",
      status: "DRAFT",
      orderingStatus: "NONE",
      lines: [],
    } as unknown as ProcurementRequestDetail;
    const props: ProcurementDrawerProps = {
      open: true,
      documentId: "r1",
      mode: "view",
      canUpdate: true,
      submitFromDrawer: true,
      onClose: vi.fn(),
      onTransition: vi.fn(),
      queryKey: "pr",
      api: {
        get: vi.fn().mockResolvedValue(detail),
        create: vi.fn(),
        replaceLines: vi.fn(),
        list: vi.fn(),
        transition: vi.fn(),
      },
    };
    render(<ProcurementRequestDrawer {...props} />, { wrapper });
    expect(await screen.findByText("PR-1")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Gửi duyệt" }),
    ).not.toBeInTheDocument();
  });
});
