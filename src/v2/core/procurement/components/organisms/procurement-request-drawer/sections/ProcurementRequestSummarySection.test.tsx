import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProcurementRequestSummarySection } from "./ProcurementRequestSummarySection";
import type { ProcurementRequestFormValue } from "../../../../form/procurementRequest.form";
import type { ProcurementRequestDetail } from "../../../../procurement.types";

const form: ProcurementRequestFormValue = {
  branchId: "b-1",
  branchName: "Chi nhánh Quận 1",
  requestDate: "2026-11-05",
  neededDate: "2026-11-12",
  title: "Mua lốp xe",
  remarks: "",
  lines: [],
};

const detail = {
  id: "h-1",
  requestNo: "GDNM-20261106-004",
  status: "APPROVED",
  orderingStatus: "NONE",
  title: "Mua lốp xe",
  branchName: "Chi nhánh Quận 1",
  createdBy: null,
  createdAt: "2026-11-05T08:00:00",
  createdByEmail: "nguoi.tao@x.vn",
  approval: {
    approverId: null,
    approverEmail: "truong.garage@x.vn",
    submit: null,
    approve: null,
    reject: null,
    cancel: null,
    close: null,
    issue: null,
  },
} as unknown as ProcurementRequestDetail;

describe("ProcurementRequestSummarySection", () => {
  it("hiện email người tạo và người duyệt thay vì dấu gạch", () => {
    render(<ProcurementRequestSummarySection form={form} detail={detail} />);
    expect(screen.getByText("nguoi.tao@x.vn")).toBeInTheDocument();
    expect(screen.getByText("truong.garage@x.vn")).toBeInTheDocument();
  });

  it("chưa có người duyệt thì hiện dấu gạch", () => {
    render(
      <ProcurementRequestSummarySection
        form={form}
        detail={{
          ...detail,
          approval: {
            approverId: null,
            approverEmail: null,
            submit: null,
            approve: null,
            reject: null,
            cancel: null,
            close: null,
            issue: null,
          },
        }}
      />,
    );
    expect(screen.getByText("Người duyệt")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1);
  });
});
