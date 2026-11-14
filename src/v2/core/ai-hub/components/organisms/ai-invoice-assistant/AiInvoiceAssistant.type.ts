import type { AiRequestContext } from "../../../hooks/aiInvoiceDraft.helper";
import type { AiCreateRequestResult, AiInvoiceApi } from "../../../aiHub.type";

export interface AiInvoiceAssistantProps {
  api: AiInvoiceApi;
  /** Chi nhánh và ngày đề nghị gắn vào phiếu được tạo */
  context?: AiRequestContext;
  /** Gọi sau khi tạo xong đề nghị mua (làm mới danh sách, mở phiếu) */
  onCreated?: (result: AiCreateRequestResult) => void;
}
