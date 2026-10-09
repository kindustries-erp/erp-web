import React, { useState } from "react";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { MockInvoicePdfCanvas } from "./V2StandardDrawer.mock-pdf-canvas";
import {
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const MockInvoicePdfPreview = () => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-3">
      {/* PDF Controls Toolbar */}
      <div className="flex items-center justify-between p-2 rounded-lg border border-border/70 bg-muted/40 text-xs">
        <div className="flex items-center gap-2">
          <V2Button
            size="icon-sm"
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </V2Button>
          <span className="font-mono text-muted-foreground">
            Trang {page} / 2
          </span>
          <V2Button
            size="icon-sm"
            variant="ghost"
            disabled={page === 2}
            onClick={() => setPage(2)}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </V2Button>
        </div>

        <div className="flex items-center gap-1.5">
          <V2Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </V2Button>
          <span className="font-mono text-muted-foreground w-12 text-center">
            {zoom}%
          </span>
          <V2Button
            size="icon-sm"
            variant="ghost"
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </V2Button>
          <div className="h-4 w-px bg-border mx-1" />
          <V2Button size="sm" variant="outline" className="gap-1 text-xs">
            <Printer className="w-3.5 h-3.5" />
            In
          </V2Button>
          <V2Button size="sm" variant="outline" className="gap-1 text-xs">
            <Download className="w-3.5 h-3.5" />
            Tải PDF
          </V2Button>
        </div>
      </div>

      <MockInvoicePdfCanvas zoom={zoom} />
    </div>
  );
};
