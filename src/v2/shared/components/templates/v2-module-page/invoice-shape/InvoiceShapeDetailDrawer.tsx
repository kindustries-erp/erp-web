import * as React from "react";
import { V2FilePreviewPanel } from "@/v2/shared/components/organisms/v2-file-preview-panel";
import { DrawerSection } from "@/v2/shared/components/molecules/v2-drawer-section";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { Badge } from "@/v2/shared/ui";
import { sampleInvoiceXml } from "./invoiceShape.data";
import type { FakeInvoice } from "./invoiceShape.data";
import { InvoiceShapeDetailFinance } from "./InvoiceShapeDetailFinance";
import { InvoiceShapeDetailInfo } from "./InvoiceShapeDetailInfo";
import { InvoiceShapeDetailLinks } from "./InvoiceShapeDetailLinks";

interface Props {
  invoice: FakeInvoice;
  open: boolean;
  onClose: () => void;
  onPost: () => void;
}

const TABS = [
  { key: "info", label: "Thông tin" },
  { key: "finance", label: "Tài chính", hideRightPanel: true },
  { key: "links", label: "Chứng từ liên kết", hideRightPanel: true },
];

/** Drawer chi tiết: 2 cột, 3 tab, xem/sửa, panel phải xem trước hóa đơn, thao tác ở chân drawer */
export const InvoiceShapeDetailDrawer: React.FC<Props> = ({
  invoice,
  open,
  onClose,
  onPost,
}) => {
  const [mode, setMode] = React.useState<"view" | "edit">("view");
  const [form, setForm] = React.useState(invoice);
  const patch = (change: Partial<FakeInvoice>) =>
    setForm((current) => ({ ...current, ...change }));

  return (
    <V2StandardDrawer
      id={`invoice:${invoice.id}`}
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      confirmOnClose
      title={`Hóa đơn ${invoice.serialNo}-${invoice.invoiceNo}`}
      subtitle={invoice.partner}
      titleExtra={
        <Badge variant={form.posting === "POSTED" ? "success" : "warning"}>
          {form.posting === "POSTED" ? "Đã hạch toán" : "Chưa hạch toán"}
        </Badge>
      }
      layout="2-columns"
      size="xl"
      tabs={TABS}
      rightPanel={
        <DrawerSection title="Tệp hóa đơn">
          <V2FilePreviewPanel
            file={{
              name: `${invoice.invoiceNo}.xml`,
              text: sampleInvoiceXml(form),
            }}
            height={320}
            onDownload={() => undefined}
          />
        </DrawerSection>
      }
      actions={
        mode === "edit"
          ? [
              {
                label: "Hủy",
                onClick: () => {
                  setForm(invoice);
                  setMode("view");
                },
              },
              { label: "Lưu", primary: true, onClick: () => setMode("view") },
            ]
          : [{ label: "Đóng", onClick: onClose }]
      }
      actionGroups={[
        {
          groupLabel: "Thao tác",
          items: [
            { label: "Hạch toán", onClick: onPost },
            { label: "Tải PDF gốc", onClick: () => undefined },
          ],
        },
      ]}
    >
      {({ activeTabKey }) =>
        activeTabKey === "finance" ? (
          <InvoiceShapeDetailFinance invoice={form} />
        ) : activeTabKey === "links" ? (
          <InvoiceShapeDetailLinks />
        ) : (
          <InvoiceShapeDetailInfo
            form={form}
            editing={mode === "edit"}
            onChange={patch}
          />
        )
      }
    </V2StandardDrawer>
  );
};
