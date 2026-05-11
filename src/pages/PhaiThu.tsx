import { useState } from "react";
import { useT } from "@/core/i18n";
import { ArWorkbenchPanel } from "@/modules/finance/components/ArWorkbenchPanel";
import { PartnerLedgerPage } from "@/modules/finance/components/PartnerLedgerPage";
import { cn } from "@/shared/utils";

type TabKey = "workbench" | "legacy";

export function PhaiThu() {
  const t = useT();
  const [tab, setTab] = useState<TabKey>("workbench");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-2">
        <button
          type="button"
          onClick={() => setTab("workbench")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            tab === "workbench"
              ? "bg-[color:var(--primary)] text-white shadow-sm"
              : "text-[color:var(--muted-fg)] hover:bg-[color:var(--muted)]",
          )}
        >
          AR Workbench mới
        </button>
        <button
          type="button"
          onClick={() => setTab("legacy")}
          className={cn(
            "rounded-xl px-4 py-2 text-sm font-medium transition",
            tab === "legacy"
              ? "bg-[color:var(--primary)] text-white shadow-sm"
              : "text-[color:var(--muted-fg)] hover:bg-[color:var(--muted)]",
          )}
        >
          Sổ công nợ hiện tại
        </button>
        <span className="ml-auto px-3 text-xs text-[color:var(--muted-fg)]">
          Flow mới chạy song song, không thay thế dữ liệu cũ.
        </span>
      </div>

      {tab === "workbench" ? (
        <ArWorkbenchPanel />
      ) : (
        <PartnerLedgerPage
          itemType="RECEIVABLE"
          title={t("phaithu.title")}
          desc={t("phaithu.desc")}
        />
      )}
    </div>
  );
}
