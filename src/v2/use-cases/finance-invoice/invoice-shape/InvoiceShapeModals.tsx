import * as React from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { V2Textarea } from "@/v2/shared/components/atoms/v2-textarea";
import { V2Combobox } from "@/v2/shared/components/molecules/v2-combobox";
import { DrawerField } from "@/v2/shared/components/molecules/v2-drawer-field";
import { V2FileUpload } from "@/v2/shared/components/molecules/v2-file-upload";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { BRANCHES } from "./invoiceShape.data";

interface BulkProps {
  open: boolean;
  count: number;
  onOpenChange: (open: boolean) => void;
}

/** Modal gán chi nhánh và ghi chú hàng loạt cho các hóa đơn đang chọn */
export const InvoiceShapeBulkModal: React.FC<BulkProps> = ({
  open,
  count,
  onOpenChange,
}) => {
  const [branch, setBranch] = React.useState<string | null>(null);
  const [note, setNote] = React.useState("");
  return (
    <V2Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Sửa hàng loạt (${count} hóa đơn)`}
      size="md"
      footer={
        <>
          <V2Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </V2Button>
          <V2Button onClick={() => onOpenChange(false)}>Áp dụng</V2Button>
        </>
      }
    >
      <div className="grid gap-3">
        <DrawerField label="Chi nhánh">
          <V2Combobox
            options={BRANCHES}
            value={branch}
            onValueChange={setBranch}
            clearable
          />
        </DrawerField>
        <DrawerField label="Ghi chú">
          <V2Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </DrawerField>
      </div>
    </V2Modal>
  );
};

interface ImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal nhập XML/ZIP/PDF: kéo thả, kiểm tra định dạng và dung lượng */
export const InvoiceShapeImportModal: React.FC<ImportProps> = ({
  open,
  onOpenChange,
}) => {
  const [names, setNames] = React.useState<string[]>([]);
  return (
    <V2Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nhập hóa đơn từ tệp"
      size="md"
      footer={<V2Button onClick={() => onOpenChange(false)}>Xong</V2Button>}
    >
      <div className="grid gap-3">
        <V2FileUpload
          accept={[".xml", ".zip", ".pdf"]}
          maxSizeBytes={20 * 1024 * 1024}
          hint="XML, ZIP hoặc PDF, tối đa 20 MB"
          onFilesSelected={(accepted) =>
            setNames(accepted.map((file) => file.name))
          }
        />
        {names.length > 0 && (
          <ul className="text-sm text-muted-foreground">
            {names.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>
    </V2Modal>
  );
};
