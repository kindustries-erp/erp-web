import type { GarageWorkflowText } from "../garageWorkflowTypes";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

/** Khối nội dung viết tay (chưa dịch): mỗi chuỗi có key i18n và bản tiếng Việt mặc định. */
export type StaticGuideBlock =
  | { type: "paragraph"; text: GarageWorkflowText }
  | { type: "bullets"; items: GarageWorkflowText[] }
  | {
      type: "definitions";
      items: { term: GarageWorkflowText; text: GarageWorkflowText }[];
    };

export interface StaticGuideSection {
  kind: "static";
  id: string;
  title: GarageWorkflowText;
  blocks: StaticGuideBlock[];
}

/** Mục sinh tự động từ dữ liệu sơ đồ nên luôn khớp với hình. */
export interface GeneratedGuideSection {
  kind: "steps" | "flows" | "modules";
  id: string;
  title: GarageWorkflowText;
  intro?: GarageWorkflowText;
}

export interface GuideContent {
  title: GarageWorkflowText;
  subtitle: GarageWorkflowText;
  sections: (StaticGuideSection | GeneratedGuideSection)[];
}

const bullets = (prefix: string, items: string[]): StaticGuideBlock => ({
  type: "bullets",
  items: items.map((fallback, index) =>
    txt(`${prefix}.b${index + 1}`, fallback),
  ),
});

/** Nhãn "Trang" ở chân trang. Key i18n: workflow.guide.pageLabel */
export const GUIDE_PAGE_LABEL = txt("workflow.guide.pageLabel", "Trang");

/** Tiêu đề mục lục. Key i18n: workflow.guide.toc */
export const GUIDE_TOC_LABEL = txt("workflow.guide.toc", "Mục lục");

/** Tài liệu hướng dẫn nội bộ cho người dùng cuối. Key i18n: workflow.guide.endUser.* */
export const END_USER_GUIDE: GuideContent = {
  title: txt(
    "workflow.guide.endUser.title",
    "Hướng dẫn nội bộ: vận hành garage, thu chi và công nợ",
  ),
  subtitle: txt(
    "workflow.guide.endUser.subtitle",
    "Tài liệu đi kèm sơ đồ quy trình dành cho người dùng cuối",
  ),
  sections: [
    {
      kind: "static",
      id: "purpose",
      title: txt(
        "workflow.guide.endUser.purpose.title",
        "Mục đích và đối tượng",
      ),
      blocks: [
        {
          type: "paragraph",
          text: txt(
            "workflow.guide.endUser.purpose.p1",
            "Tài liệu này giải thích từng bước của quy trình garage trên hệ thống: từ lúc tiếp nhận xe, sửa chữa, kết thúc phiếu, đến thu tiền, chi tiền, công nợ và báo cáo. Dành cho cố vấn dịch vụ, kế toán và quản lý, không đòi hỏi kiến thức kỹ thuật.",
          ),
        },
        {
          type: "paragraph",
          text: txt(
            "workflow.guide.endUser.purpose.p2",
            "Sơ đồ ở trang đầu cho cái nhìn tổng thể. Các trang sau giải thích chi tiết và dùng để tra cứu khi cần.",
          ),
        },
      ],
    },
    {
      kind: "static",
      id: "howToRead",
      title: txt("workflow.guide.endUser.howToRead.title", "Cách đọc sơ đồ"),
      blocks: [
        bullets("workflow.guide.endUser.howToRead", [
          "Mỗi hàng là một bộ phận chịu trách nhiệm: Xưởng và cố vấn, Hệ thống tự động, Kế toán thu tiền, Kế toán chi tiền, Kế toán chi đặc thù, Công nợ và đối soát, Quản lý và báo cáo.",
          "Mỗi cột là một giai đoạn của phiếu dịch vụ, từ Tiếp nhận và báo giá đến Đối soát và báo cáo.",
          "Vòng số trên thẻ là thứ tự thao tác: làm theo số tăng dần sẽ đi hết quy trình.",
          "Mũi tên màu A, B, C, D là những việc hệ thống tự làm, không cần ai bấm thêm. Mũi tên M là thao tác thủ công của người dùng.",
          "Nét đứt là bước chạy nền hoặc cần xác minh. Nét chấm là luồng chỉ đọc dữ liệu để tổng hợp báo cáo.",
          "Thẻ viền xanh lá là trạng thái Kết thúc (mã 3), thẻ viền đỏ là Hủy (mã 9).",
        ]),
      ],
    },
    {
      kind: "steps",
      id: "steps",
      title: txt("workflow.guide.endUser.steps.title", "Các bước vận hành"),
      intro: txt(
        "workflow.guide.endUser.steps.intro",
        "Các bước dưới đây lấy trực tiếp từ sơ đồ, theo đúng số thứ tự trên thẻ.",
      ),
    },
    {
      kind: "static",
      id: "money",
      title: txt(
        "workflow.guide.endUser.money.title",
        "Giải thích các khoản tiền",
      ),
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: txt(
                "workflow.guide.endUser.money.dt.term",
                "Dự thu (EXPECTED)",
              ),
              text: txt(
                "workflow.guide.endUser.money.dt.text",
                "Phiếu thu do hệ thống tự tạo khi phiếu dịch vụ Kết thúc, để nhắc khoản phải thu. Hạn thu bằng ngày hoàn thành cộng 7 ngày. Chưa tính vào thực thu và không cấn trừ công nợ. Nếu phiếu rời khỏi Kết thúc thì phiếu Dự thu tự bị hủy.",
              ),
            },
            {
              term: txt("workflow.guide.endUser.money.t1.term", "Thực thu"),
              text: txt(
                "workflow.guide.endUser.money.t1.text",
                "Phiếu thu không còn ở trạng thái Dự thu và không bị hủy. Tính vào dòng tiền ròng và trừ công nợ phải thu của phiếu dịch vụ.",
              ),
            },
            {
              term: txt(
                "workflow.guide.endUser.money.dc.term",
                "Dự chi (PENDING / APPROVED)",
              ),
              text: txt(
                "workflow.guide.endUser.money.dc.text",
                "Phiếu chi đã lập nhưng chưa chi tiền: đang chờ duyệt hoặc đã duyệt. Chưa trừ công nợ phải trả.",
              ),
            },
            {
              term: txt(
                "workflow.guide.endUser.money.p1.term",
                "Thực chi (PAID)",
              ),
              text: txt(
                "workflow.guide.endUser.money.p1.text",
                "Phiếu chi đã chi tiền. Trừ công nợ phải trả và bị khóa: không đổi được trạng thái hay loại phiếu.",
              ),
            },
            {
              term: txt(
                "workflow.guide.endUser.money.hh.term",
                "HHBH (nội dung 4)",
              ),
              text: txt(
                "workflow.guide.endUser.money.hh.text",
                "Phiếu chi thuộc nhóm hoa hồng. Không trừ công nợ. Khi ở trạng thái Đã duyệt hoặc Đã chi, hệ thống tự ghi vào OPEX và hiện ở P&L mục 4.2 Chi phí bán hàng.",
              ),
            },
            {
              term: txt(
                "workflow.guide.endUser.money.vt.term",
                "Vật tư tiêu hao (nội dung 10)",
              ),
              text: txt(
                "workflow.guide.endUser.money.vt.text",
                "Phiếu chi vật tư dùng trong xưởng (mã cũ là 8). Không trừ công nợ. Khi ở trạng thái Đã duyệt hoặc Đã chi, hệ thống tự ghi vào OPEX và hiện ở P&L trong nhóm Giá vốn.",
              ),
            },
            {
              term: txt("workflow.guide.endUser.money.opex.term", "OPEX"),
              text: txt(
                "workflow.guide.endUser.money.opex.text",
                "Chi phí vận hành của garage: khoản nhập tay, khoản lặp hàng tháng, hoa hồng, cùng các khoản HHBH và vật tư tiêu hao do hệ thống tự ghi.",
              ),
            },
          ],
        },
      ],
    },
    {
      kind: "flows",
      id: "flows",
      title: txt("workflow.guide.endUser.flows.title", "Các luồng tự động"),
      intro: txt(
        "workflow.guide.endUser.flows.intro",
        "Mỗi luồng dưới đây chạy tự động qua Garage Hub: người dùng chỉ cần thực hiện thao tác bắt đầu, phần còn lại hệ thống tự xử lý.",
      ),
    },
    {
      kind: "static",
      id: "rules",
      title: txt("workflow.guide.endUser.rules.title", "Quy tắc cần nhớ"),
      blocks: [
        bullets("workflow.guide.endUser.rules", [
          "Phiếu chi đã chi (PAID) bị khóa: không đổi được trạng thái hay loại phiếu, nên kiểm tra kỹ trước khi chi.",
          "Hoa hồng bán hàng, hoa hồng xưởng và HHBH không cấn trừ vào công nợ phiếu dịch vụ.",
          "Phiếu còn phải thu bằng 0 hoặc âm thì hệ thống không sinh Dự thu.",
          "Phiếu Hủy (mã 9) và phiếu đã xóa mềm bị loại khỏi báo cáo doanh thu và lãi gộp.",
          "Doanh thu, chi phí và lãi gộp tính theo ngày hoàn thành công việc của phiếu.",
          "Đồng bộ KGara chạy theo các mốc 09:15, 15:15, 16:15, 17:15, 21:15. Cần số liệu mới hơn thì bấm Đồng bộ tay.",
          "Phiếu hoa hồng chỉ được sinh khi mở báo cáo P&L, không có lịch chạy riêng.",
        ]),
      ],
    },
  ],
};

/** Tài liệu kỹ thuật cho lập trình viên. Key i18n: workflow.guide.dev.* */
export const DEV_GUIDE: GuideContent = {
  title: txt(
    "workflow.guide.dev.title",
    "Tài liệu kỹ thuật: kiến trúc module Garage",
  ),
  subtitle: txt(
    "workflow.guide.dev.subtitle",
    "Tài liệu đi kèm sơ đồ kiến trúc, dành cho lập trình viên",
  ),
  sections: [
    {
      kind: "static",
      id: "overview",
      title: txt("workflow.guide.dev.overview.title", "Tổng quan"),
      blocks: [
        {
          type: "paragraph",
          text: txt(
            "workflow.guide.dev.overview.p1",
            "Hệ thống garage gồm bốn module: Hoạt động garage (đồng bộ KGara, phiếu dịch vụ, cấn trừ, P&L), Garage Hub (điều phối nghiệp vụ tiền), Thu chi (phiếu thu chi) và OPEX (chi phí vận hành). Phần lớn nghiệp vụ tiền đi qua Garage Hub, nơi các handler tự kích hoạt khi có sự kiện.",
          ),
        },
        {
          type: "paragraph",
          text: txt(
            "workflow.guide.dev.overview.p2",
            "Trên sơ đồ, mỗi khung là một module, thẻ là service hoặc bảng dữ liệu, mũi tên màu A–D là các luồng tự động, mũi tên M là thao tác thủ công và lớp chỉ đọc nằm ở dải dưới cùng.",
          ),
        },
      ],
    },
    {
      kind: "modules",
      id: "modules",
      title: txt("workflow.guide.dev.modules.title", "Bốn module"),
      intro: txt(
        "workflow.guide.dev.modules.intro",
        "Danh sách service và bảng dữ liệu trong từng khung, lấy trực tiếp từ sơ đồ.",
      ),
    },
    {
      kind: "flows",
      id: "flows",
      title: txt("workflow.guide.dev.flows.title", "Luồng tự động chi tiết"),
      intro: txt(
        "workflow.guide.dev.flows.intro",
        "Mỗi luồng gồm nguồn kích hoạt, các bước gọi theo thứ tự (nguồn → đích, cơ chế gọi) và kết quả ghi vào bảng dữ liệu.",
      ),
    },
    {
      kind: "static",
      id: "tables",
      title: txt("workflow.guide.dev.tables.title", "Bảng dữ liệu"),
      blocks: [
        {
          type: "definitions",
          items: [
            {
              term: txt("workflow.guide.dev.tables.cases.term", "kgara_cases"),
              text: txt(
                "workflow.guide.dev.tables.cases.text",
                "Phiếu dịch vụ và dòng chi tiết, đồng bộ từ KGara. Cột tinh_trang_dich_vu: 3 là Kết thúc, 9 là Hủy (hai mã đã xác minh trong code).",
              ),
            },
            {
              term: txt(
                "workflow.guide.dev.tables.settlements.term",
                "kgara_case_settlements",
              ),
              text: txt(
                "workflow.guide.dev.tables.settlements.text",
                "Cấn trừ giữa phiếu dịch vụ với phiếu thu chi, sao kê ngân hàng và hóa đơn. Phiếu thu không phải EXPECTED luôn có cấn trừ; phiếu chi chỉ có khi PAID và không thuộc nhóm HHBH, vật tư tiêu hao hay hoa hồng.",
              ),
            },
            {
              term: txt(
                "workflow.guide.dev.tables.vouchers.term",
                "kgara_cashflow_vouchers",
              ),
              text: txt(
                "workflow.guide.dev.tables.vouchers.text",
                "Phiếu thu chi. voucherType là RECEIPT hoặc PAYMENT; paymentStatus là EXPECTED, PENDING, APPROVED, PAID hoặc CANCELLED. Phiếu chi PAID bị khóa trạng thái và loại phiếu.",
              ),
            },
            {
              term: txt(
                "workflow.guide.dev.tables.opex.term",
                "kgara_operating_expenses",
              ),
              text: txt(
                "workflow.guide.dev.tables.opex.text",
                "Chi phí vận hành: khoản nhập tay, khoản lặp hàng tháng, hoa hồng tự sinh, HHBH (vào chi phí bán hàng) và vật tư tiêu hao (vào giá vốn). Dòng tự ghi từ phiếu chi gắn source_cashflow_voucher_id.",
              ),
            },
          ],
        },
      ],
    },
    {
      kind: "static",
      id: "mechanisms",
      title: txt("workflow.guide.dev.mechanisms.title", "Cơ chế kích hoạt"),
      blocks: [
        bullets("workflow.guide.dev.mechanisms", [
          "Sync: KgaraSyncScheduler chạy cron 09:15, 15:15, 16:15, 17:15, 21:15 (giờ Việt Nam) cùng heartbeat 30 giây để mỗi mốc chỉ chạy một lần. Chỉ hoạt động khi biến môi trường ENABLE_CRON là true.",
          "Sync tăng dần theo watermark updatedSince, lùi 10 phút. Phiếu vắng mặt 2 lần liên tiếp bị xóa mềm, xuất hiện lại thì tự phục hồi.",
          "Handler của Garage Hub được gọi trực tiếp qua DI, không dùng hàng đợi. CashflowSettleHandler chạy cùng transaction với việc lưu phiếu.",
          "PnlCommissionHandler chạy fire-and-forget khi mở báo cáo P&L, không có cron riêng. Phiếu hoa hồng đã PAID không bao giờ bị sửa số tiền; phần chênh lệch sinh phiếu delta.",
          "Phân loại sổ quỹ dùng chung một hàm: Thực thu, Dự thu, Thực chi, Dự chi; phiếu CANCELLED bị loại khỏi mọi tổng.",
        ]),
      ],
    },
    {
      kind: "static",
      id: "verify",
      title: txt("workflow.guide.dev.verify.title", "Điểm cần xác minh"),
      blocks: [
        bullets("workflow.guide.dev.verify", [
          "SyncCaseService gọi cả Garage Hub (handleCaseTransition) lẫn GarageCaseForecastService trực tiếp khi phiếu đổi trạng thái. Có thể ghi trùng Dự thu: cần kiểm tra lại trước khi sửa luồng này.",
          "Các mã trạng thái 0, 1, 2 chỉ có trong skill API, không có hằng số trong code. Chỉ mã 3 (Kết thúc) và 9 (Hủy) đã được xác minh trong code.",
        ]),
      ],
    },
    {
      kind: "static",
      id: "codeRefs",
      title: txt("workflow.guide.dev.codeRefs.title", "Nơi đọc code"),
      blocks: [
        bullets("workflow.guide.dev.codeRefs", [
          "Garage Hub: erp-api/src/kgara-api-core/hub/ (garage-hub.service.ts và thư mục handlers).",
          "Dự thu: erp-api/src/kgara-api-core/services/garage-case-forecast.service.ts.",
          "Quy tắc phiếu chi: erp-api/src/kgara-api-core/helpers/garage-cashflow-payment-rules.ts; phân loại sổ quỹ: helpers/garage-ledger-classifier.ts.",
          "Lịch sync: erp-api/src/kgara-api-core/kgara-sync.scheduler.ts. Tri thức module: erp-api/.agents/skills/modules/garage-cashflow/SKILL.md.",
        ]),
      ],
    },
  ],
};
