import { useState } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { FileText, Eye } from "lucide-react";

interface InvoiceBadgeLinksProps {
  invoiceIds?: string[];
  onOpenInvoice: (id: string) => void;
  labelPrefix?: string;
}

export function InvoiceBadgeLinks({
  invoiceIds = [],
  onOpenInvoice,
  labelPrefix = "hóa đơn",
}: InvoiceBadgeLinksProps) {
  const [open, setOpen] = useState(false);
  const count = invoiceIds.length;

  if (count === 0) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  const content = (
    <div className="w-64 p-2 space-y-1">
      <p className="text-xs font-semibold text-gray-500 mb-2 px-2">
        Danh sách hóa đơn liên kết ({count})
      </p>
      <div className="max-h-[200px] overflow-y-auto pr-1 space-y-1">
        {invoiceIds.map((id, idx) => (
          <div
            key={id}
            className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-md text-sm border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-2 text-gray-700 truncate">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate" title={id}>
                HĐ {idx + 1}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                setOpen(false);
                setTimeout(() => onOpenInvoice(id), 100);
              }}
              title="Xem chi tiết hóa đơn"
            >
              <Eye className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Popover open={open} onOpenChange={setOpen} content={content}>
      <Badge
        variant="secondary"
        className="cursor-pointer hover:bg-gray-200 hover:text-gray-900 transition-colors"
      >
        {count} {labelPrefix}
      </Badge>
    </Popover>
  );
}
