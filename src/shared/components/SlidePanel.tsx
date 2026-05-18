import { useUIStore } from "@/core/config/uiStore";
import { useTransactionStore } from "@/core/config/transactionStore";
import { useSettingsStore } from "@/core/config/settingsStore";
import { fmtMoney, bangChu } from "@/shared/utils";
import { useState } from "react";
import { useT } from "@/core/i18n";

function DetailView() {
  const { panelContent, closePanel } = useUIStore();
  const { getDs } = useTransactionStore();
  const t = useT();
  if (!panelContent || panelContent.kind !== "detail") return null;
  const r = getDs(panelContent.src).find((x) => x.id === panelContent.id);
  if (!r) return null;

  const isThu = r.type === "thu";
  const approved = r.trangThai === "da-duyet";
  const isNH = panelContent.src === "tiengui";
  const tl = isNH
    ? isThu
      ? t("panel.unt")
      : t("panel.unc")
    : isThu
      ? t("panel.receipt")
      : t("panel.payment");

  const DetailRow = ({
    label,
    value,
    cls = "",
  }: {
    label: string;
    value: React.ReactNode;
    cls?: string;
  }) => (
    <div className="flex justify-between items-start py-[7px] border-b border-[color:var(--border-light)] text-xs last:border-b-0">
      <span className="text-[color:var(--muted-fg)] flex-shrink-0">
        {label}
      </span>
      <span className={`text-foreground font-medium text-right ml-3 ${cls}`}>
        {value}
      </span>
    </div>
  );

  return (
    <>
      {/* Header */}
      <div className="px-[18px] py-[14px] border-b border-border flex items-center gap-[10px] flex-shrink-0">
        <div className="w-[30px] h-[30px] bg-[color:var(--muted)] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {t("panel.detailTitle")} {tl}
          </div>
          <div className="text-xs text-[color:var(--muted-fg)]">{r.code}</div>
        </div>
        <button
          className="ml-auto text-[color:var(--faint)] text-xl leading-none px-1 hover:text-foreground"
          onClick={closePanel}
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-[18px]">
        <Section title={t("panel.generalInfo")}>
          <DetailRow label={t("panel.date")} value={r.date} />
          <DetailRow
            label={`${t("panel.voucherNo")} ${isNH ? (isThu ? "UNT" : "UNC") : ""}`}
            value={<code className="font-mono">{r.code}</code>}
          />
          <DetailRow label={t("panel.type")} value={r.loai} />
          <DetailRow label={t("panel.source")} value={r.nguonQuy} />
          <DetailRow
            label={t("panel.description")}
            value={r.dienGiai}
            cls="max-w-[220px]"
          />
        </Section>
        <Section
          title={isThu ? t("panel.partnerPayer") : t("panel.partnerReceiver")}
        >
          <DetailRow label={t("panel.partnerName")} value={r.doituong} />
          {r.mst && <DetailRow label={t("panel.taxCode")} value={r.mst} />}
          <DetailRow
            label={t("panel.address")}
            value={r.diachi}
            cls="max-w-[210px]"
          />
        </Section>
        <Section title={t("panel.accounting")}>
          <DetailRow label={t("panel.debitAcc")} value={r.tknNo} />
          <DetailRow label={t("panel.creditAcc")} value={r.tknCo} />
          <DetailRow
            label={t("panel.amount")}
            value={<span className="text-[15px]">₫ {fmtMoney(r.amount)}</span>}
          />
          <DetailRow
            label={t("panel.inWords")}
            value={
              <em className="text-[color:var(--muted-fg)]">
                {bangChu(r.amount)}
              </em>
            }
          />
        </Section>
        <Section title={t("panel.control")}>
          <DetailRow label={t("panel.preparer")} value={r.nguoiLap} />
          <DetailRow label={t("panel.approver")} value={r.nguoiDuyet} />
          <DetailRow
            label={t("panel.statusLabel")}
            value={
              <span
                className={`inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[11px] font-medium border ${
                  approved
                    ? "bg-approve-bg text-approve-fg border-[#a8dbb8]"
                    : "bg-warn-bg text-warn-fg border-[#f5d580]"
                }`}
              >
                {approved ? t("status.approved") : t("status.pending")}
              </span>
            }
          />
        </Section>
      </div>

      {/* Footer */}
      <div className="px-[18px] py-3 border-t border-border flex gap-2 justify-end flex-shrink-0">
        {approved ? (
          <>
            <Btn onClick={closePanel}>{t("panel.close")}</Btn>
            <Btn onClick={closePanel}>{t("panel.print")}</Btn>
          </>
        ) : (
          <>
            <Btn onClick={closePanel}>{t("panel.close")}</Btn>
            <Btn onClick={closePanel}>{t("panel.edit")}</Btn>
            <Btn primary onClick={closePanel}>
              {t("panel.approve")}
            </Btn>
          </>
        )}
      </div>
    </>
  );
}

function NewTxForm() {
  const { panelContent, closePanel } = useUIStore();
  const { nhData } = useSettingsStore();
  const [charCount, setCharCount] = useState(0);
  const [amountRaw, setAmountRaw] = useState("");
  const [bangChuVal, setBangChuVal] = useState("");
  const t = useT();

  if (!panelContent || panelContent.kind !== "newTx") return null;
  const { txType, src } = panelContent;
  const isThu = txType === "thu";
  const isNH = src === "tiengui";
  const code =
    (isNH ? "NH" : "") +
    (isThu ? "PT" : "PC") +
    "0" +
    String(Date.now()).slice(-6);
  const today = new Date();
  const ds =
    String(today.getDate()).padStart(2, "0") +
    "/" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "/" +
    today.getFullYear();
  const tl = isNH
    ? isThu
      ? t("panel.untFull")
      : t("panel.uncFull")
    : isThu
      ? t("panel.receiptTitle")
      : t("panel.paymentTitle");

  const qOpts = isNH
    ? nhData.filter((x) => x.active).map((x) => `${x.bank} - ${x.stk}`)
    : ["Quỹ tiền mặt chính", "Quỹ tiền mặt phụ"];

  const loOpts = isNH
    ? isThu
      ? ["UNT - Thu bán hàng", "UNT - Thu nợ KH", "UNT - Thu khác"]
      : ["UNC - Thanh toán NCC", "UNC - Chi lương", "UNC - Chi khác"]
    : isThu
      ? ["Thu khác", "Thu bán hàng", "Thu nợ KH"]
      : ["Chi khác", "Chi thanh toán NCC", "Chi lương"];

  const tknNoOpts = isThu
    ? isNH
      ? ["1121 - TG NH VNĐ", "1122 - TG NH ngoại tệ"]
      : ["1111 - Tiền mặt VNĐ"]
    : ["331 - Phải trả NCC", "334 - Phải trả lương"];

  const tknCoOpts = isThu
    ? ["1311 - Phải thu KH", "511 - Doanh thu"]
    : isNH
      ? ["1121 - TG NH VNĐ"]
      : ["1111 - Tiền mặt VNĐ"];

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmountRaw(raw);
    const n = parseInt(raw) || 0;
    setBangChuVal(n > 0 ? bangChu(n) : "");
  };

  return (
    <>
      <div className="px-[18px] py-[14px] border-b border-border flex items-center gap-[10px] flex-shrink-0">
        <div className="w-[30px] h-[30px] bg-[color:var(--muted)] rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">
            {t("panel.newTitle")} {tl}
          </div>
          <div className="text-xs text-[color:var(--muted-fg)]">
            {t("panel.createNew")} — {code}
          </div>
        </div>
        <button
          className="ml-auto text-[color:var(--faint)] text-xl leading-none px-1 hover:text-foreground"
          onClick={closePanel}
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-[18px]">
        <Section title={t("panel.generalInfo")}>
          <FormRow label={t("panel.voucherDate")} required>
            <input className="form-input" type="text" defaultValue={ds} />
          </FormRow>
          <FormRow label={t("panel.autoCode")}>
            <input className="form-input readonly" value={code} readOnly />
          </FormRow>
          <FormRow label={t("panel.typeField")} required>
            <select className="form-select">
              {loOpts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FormRow>
          <FormRow
            label={isNH ? t("panel.bankAccountField") : t("panel.fundField")}
            required
          >
            <select className="form-select">
              {qOpts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FormRow>
          <FormRow label={t("panel.descField")} required>
            <textarea
              className="form-textarea"
              maxLength={255}
              placeholder={t("panel.descPlaceholder")}
              onChange={(e) => setCharCount(e.target.value.length)}
            />
            <div className="text-right text-[10px] text-[color:var(--faint)] mt-[2px]">
              {charCount}/255
            </div>
          </FormRow>
        </Section>

        <Section
          title={isThu ? t("panel.partnerPayer") : t("panel.partnerReceiver")}
        >
          <FormRow label={t("panel.partnerField")} required>
            <input
              className="form-input"
              placeholder={t("panel.findAndSelect")}
            />
          </FormRow>
          <FormRow label={t("panel.taxCodeField")}>
            <input className="form-input" placeholder="—" />
          </FormRow>
          <FormRow label={t("panel.addressField")}>
            <input className="form-input" placeholder="—" />
          </FormRow>
        </Section>

        <Section title={t("panel.accounting")}>
          <FormRow label={t("panel.debitAccField")} required>
            <select className="form-select">
              {tknNoOpts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FormRow>
          <FormRow label={t("panel.creditAccField")} required>
            <select className="form-select">
              {tknCoOpts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </FormRow>
          <FormRow label={t("panel.amountField")} required>
            <div className="flex items-center gap-2">
              <select className="form-select w-[68px] flex-shrink-0">
                <option>VND</option>
                <option>USD</option>
              </select>
              <input
                className="form-input flex-1"
                type="text"
                placeholder="0"
                value={
                  amountRaw ? parseInt(amountRaw).toLocaleString("vi-VN") : ""
                }
                onChange={handleAmount}
              />
            </div>
          </FormRow>
          <FormRow label={t("panel.inWordsField")}>
            <input
              className="form-input readonly"
              value={bangChuVal}
              readOnly
              placeholder="—"
            />
          </FormRow>
        </Section>

        <Section title={t("panel.attachments")}>
          <div className="border border-dashed border-[color:var(--faint)] rounded-lg p-3 text-center text-[color:var(--faint)] text-xs cursor-pointer hover:border-[color:var(--muted-fg)] hover:text-[color:var(--muted-fg)]">
            {t("panel.dragOrChoose")}{" "}
            <span className="text-blue-500 cursor-pointer">
              {t("panel.chooseFile")}
            </span>
            <br />
            <span className="text-[10px]">{t("panel.fileFormats")}</span>
          </div>
        </Section>

        <Section title={t("panel.control")}>
          <FormRow label={t("panel.preparerField")} required>
            <select className="form-select">
              <option>Nguyễn Văn A</option>
            </select>
          </FormRow>
          <FormRow label={t("panel.approverField")}>
            <select className="form-select">
              <option>Trần Thị B</option>
              <option>Nguyễn Văn C</option>
            </select>
          </FormRow>
          <FormRow label={t("panel.statusLabel")}>
            <span className="inline-flex items-center px-[10px] py-[3px] rounded-[20px] text-[11px] font-medium bg-warn-bg text-warn-fg border border-[#f5d580]">
              {t("status.pending")}
            </span>
          </FormRow>
        </Section>
      </div>

      <div className="px-[18px] py-3 border-t border-border flex gap-2 justify-end flex-shrink-0">
        <Btn onClick={closePanel}>{t("panel.cancel")}</Btn>
        <Btn onClick={closePanel}>{t("panel.saveDraft")}</Btn>
        <Btn primary onClick={closePanel}>
          {t("panel.submit")}
        </Btn>
      </div>
    </>
  );
}

// ── Helpers ──
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[18px]">
      <div className="text-[10px] font-semibold text-[color:var(--faint)] uppercase tracking-[0.1em] mb-[10px] pb-[6px] border-b border-[color:var(--border-light)]">
        {title}
      </div>
      {children}
    </div>
  );
}

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-[10px]">
      <div className="text-[11px] font-medium text-[color:var(--muted-fg)] mb-1 flex items-center gap-[3px]">
        {label}
        {required && <span className="text-[#e24b4a]">*</span>}
      </div>
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      className={`px-[14px] py-[7px] rounded-lg border text-xs font-medium cursor-pointer flex items-center gap-[6px] whitespace-nowrap ${
        primary
          ? "bg-primary text-primary-fg border-primary hover:opacity-90"
          : "bg-surface text-foreground border-border hover:bg-surface-hover"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// ── Main SlidePanel ──
export function SlidePanel() {
  const { panelOpen, panelContent, closePanel } = useUIStore();

  return (
    <div
      className={`slide-panel-overlay ${panelOpen ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePanel();
      }}
    >
      <div className="slide-panel">
        {panelContent?.kind === "detail" && <DetailView />}
        {panelContent?.kind === "newTx" && <NewTxForm />}
      </div>
    </div>
  );
}
