import type { GarageWorkflowText } from "../garageWorkflowTypes";

const txt = (key: string, fallback: string): GarageWorkflowText => ({
  key,
  fallback,
});

/** Nhãn khối ví dụ. Key i18n: workflow.guide.exampleLabel */
export const GUIDE_EXAMPLE_LABEL = txt("workflow.guide.exampleLabel", "Ví dụ");

/**
 * Lời giải thích và ví dụ cụ thể, tra theo key i18n. `buildGuide` ghép vào đúng mục theo quy ước key:
 * - thẻ bước: `workflow.guide.<doc>.node.<id>.explain|example`
 * - luồng: `workflow.guide.<doc>.flowExample.<flowId>`; module: `workflow.guide.dev.moduleExample.<laneId>`
 * - gạch đầu dòng `...bN` có ví dụ ở `...bNex`; định nghĩa `....term` có ví dụ ở `....example`.
 */
export const GUIDE_DETAILS: Record<string, GarageWorkflowText> = {
  "workflow.guide.endUser.node.e1.explain": txt(
    "workflow.guide.endUser.node.e1.explain",
    "Cố vấn dịch vụ tạo phiếu dịch vụ trên phần mềm KGara khi xe vào xưởng, ghi tình trạng xe và lập báo giá cho khách. Garage Hub chưa có phiếu này cho tới lần đồng bộ KGara kế tiếp.",
  ),
  "workflow.guide.endUser.node.e1.example": txt(
    "workflow.guide.endUser.node.e1.example",
    "Xe Vios 30A-123.45 vào xưởng lúc 8:30. Cố vấn tạo phiếu trên KGara và báo giá 4.500.000đ. Phiếu xuất hiện trong hệ thống sau mốc đồng bộ 09:15.",
  ),
  "workflow.guide.endUser.node.e2.explain": txt(
    "workflow.guide.endUser.node.e2.explain",
    "Thợ sửa xe, cố vấn cập nhật chi phí từng dòng (công, phụ tùng) và ghi chú ngay trên KGara. Mỗi lần đồng bộ, hệ thống cập nhật lại số liệu của phiếu.",
  ),
  "workflow.guide.endUser.node.e2.example": txt(
    "workflow.guide.endUser.node.e2.example",
    "Thợ báo cần thay thêm má phanh 700.000đ, cố vấn thêm một dòng vào phiếu. Ở lần đồng bộ sau, tổng phiếu trong hệ thống là 5.200.000đ.",
  ),
  "workflow.guide.endUser.node.e3.explain": txt(
    "workflow.guide.endUser.node.e3.explain",
    "Cố vấn chuyển phiếu sang Kết thúc (mã 3) khi giao xe và hoàn thành công việc. Đây là mốc tính doanh thu và là điều kiện để hệ thống sinh Dự thu. Phiếu Hủy (mã 9) bị loại khỏi báo cáo.",
  ),
  "workflow.guide.endUser.node.e3.example": txt(
    "workflow.guide.endUser.node.e3.example",
    "Giao xe ngày 15/10, phiếu chuyển Kết thúc. Sau lần đồng bộ kế tiếp, hệ thống tự tạo Dự thu hạn 22/10. Nếu khách hủy sửa chữa, đặt phiếu Hủy: phiếu không vào doanh thu.",
  ),
  "workflow.guide.endUser.node.s1.explain": txt(
    "workflow.guide.endUser.node.s1.explain",
    "Hệ thống tự kéo phiếu mới và phiếu thay đổi từ KGara theo các mốc cố định trong ngày. Có nút Đồng bộ tay khi cần số liệu mới ngay. Phiếu vắng mặt trên KGara hai lần liên tiếp bị xóa mềm.",
  ),
  "workflow.guide.endUser.node.s1.example": txt(
    "workflow.guide.endUser.node.s1.example",
    "Cố vấn kết thúc phiếu lúc 15:40 và kế toán cần thu tiền ngay. Kế toán bấm Đồng bộ tay thay vì chờ mốc 16:15.",
  ),
  "workflow.guide.endUser.node.s2.explain": txt(
    "workflow.guide.endUser.node.s2.explain",
    "Màn hình theo dõi các xe đang sửa và khoản Dự thu tương ứng, giúp quản lý ước tính tiền sắp về.",
  ),
  "workflow.guide.endUser.node.s2.example": txt(
    "workflow.guide.endUser.node.s2.example",
    "Đầu tuần quản lý mở checkpoint, thấy 12 xe đang làm với Dự thu dự kiến 85.000.000đ để cân đối tiền chi trong tuần.",
  ),
  "workflow.guide.endUser.node.s3.explain": txt(
    "workflow.guide.endUser.node.s3.explain",
    "Khi phiếu chuyển sang Kết thúc, hệ thống tạo một phiếu thu EXPECTED bằng số tiền khách còn phải trả, hạn thu bằng ngày hoàn thành cộng 7 ngày. Nếu còn phải thu bằng 0 hoặc âm thì không tạo.",
  ),
  "workflow.guide.endUser.node.s3.example": txt(
    "workflow.guide.endUser.node.s3.example",
    "Phiếu 5.200.000đ, khách đã cọc 2.000.000đ: Dự thu là 3.200.000đ. Nếu khách đã trả đủ thì không có Dự thu.",
  ),
  "workflow.guide.endUser.node.s4.explain": txt(
    "workflow.guide.endUser.node.s4.explain",
    "Sau mỗi lần có phiếu thu hoặc cấn trừ gắn với phiếu dịch vụ, hệ thống tính lại Dự thu theo số còn phải thu mới nên không cần sửa tay.",
  ),
  "workflow.guide.endUser.node.s4.example": txt(
    "workflow.guide.endUser.node.s4.example",
    "Dự thu đang là 3.200.000đ, khách trả thêm 1.200.000đ. Dự thu được đặt lại còn 2.000.000đ.",
  ),
  "workflow.guide.endUser.node.s5.explain": txt(
    "workflow.guide.endUser.node.s5.explain",
    "Khi mở báo cáo P&L, hệ thống tự tạo phiếu chi hoa hồng trạng thái PENDING theo kết quả P&L. Nếu phiếu hoa hồng đã chi (PAID) mà P&L tăng thêm, hệ thống tạo phiếu chênh lệch (delta) thay vì sửa phiếu đã chi.",
  ),
  "workflow.guide.endUser.node.s5.example": txt(
    "workflow.guide.endUser.node.s5.example",
    "Kế toán mở P&L tháng 9, hệ thống tạo phiếu hoa hồng 10.000.000đ PENDING. Sau khi chi, tháng đó có thêm doanh thu và hoa hồng thành 11.000.000đ: hệ thống sinh phiếu delta 1.000.000đ.",
  ),
  "workflow.guide.endUser.node.dt.explain": txt(
    "workflow.guide.endUser.node.dt.explain",
    "Phiếu thu nhắc khoản khách sắp phải trả. Đây chưa phải tiền đã thu nên không vào thực thu và không trừ công nợ.",
  ),
  "workflow.guide.endUser.node.dt.example": txt(
    "workflow.guide.endUser.node.dt.example",
    "Dự thu 3.200.000đ hạn 22/10. Đến hạn mà khách chưa trả, kế toán dùng nó để nhắc khách và theo dõi tiền về.",
  ),
  "workflow.guide.endUser.node.t1.explain": txt(
    "workflow.guide.endUser.node.t1.explain",
    "Khi khách trả tiền, kế toán lập phiếu thu gắn với phiếu dịch vụ. Phiếu thu không còn ở trạng thái EXPECTED được tính là thực thu: trừ công nợ phải thu và cộng vào dòng tiền ròng.",
  ),
  "workflow.guide.endUser.node.t1.example": txt(
    "workflow.guide.endUser.node.t1.example",
    "Khách chuyển khoản 3.200.000đ cho phiếu 5.200.000đ (đã cọc 2.000.000đ). Kế toán lập phiếu thu gắn phiếu dịch vụ: công nợ phải thu của phiếu về 0 và hệ thống đặt lại Dự thu.",
  ),
  "workflow.guide.endUser.node.t2.explain": txt(
    "workflow.guide.endUser.node.t2.explain",
    "Kế toán khớp từng giao dịch trên sao kê ngân hàng với phiếu thu. Khoản không gắn với phiếu dịch vụ nào có thể ghi là thu ngoài sổ.",
  ),
  "workflow.guide.endUser.node.t2.example": txt(
    "workflow.guide.endUser.node.t2.example",
    "Sao kê có dòng +3.200.000đ nội dung chuyển khoản có biển số xe. Kế toán khớp dòng này với phiếu thu của khách; dòng tiền không gắn phiếu nào được ghi thu ngoài sổ.",
  ),
  "workflow.guide.endUser.node.dc.explain": txt(
    "workflow.guide.endUser.node.dc.explain",
    "Phiếu chi đã lập nhưng chưa chi tiền: đang chờ duyệt (PENDING) hoặc đã duyệt (APPROVED). Đây mới là kế hoạch chi, chưa trừ công nợ phải trả.",
  ),
  "workflow.guide.endUser.node.dc.example": txt(
    "workflow.guide.endUser.node.dc.example",
    "Kế toán lập phiếu trả nhà cung cấp phụ tùng 8.000.000đ, trưởng bộ phận duyệt. Phiếu ở APPROVED, công nợ nhà cung cấp vẫn còn 8.000.000đ cho đến khi chi tiền.",
  ),
  "workflow.guide.endUser.node.p1.explain": txt(
    "workflow.guide.endUser.node.p1.explain",
    "Phiếu chi đã chi tiền thật. Phiếu trừ công nợ phải trả và bị khóa: sau đó không đổi được trạng thái hay loại phiếu.",
  ),
  "workflow.guide.endUser.node.p1.example": txt(
    "workflow.guide.endUser.node.p1.example",
    "Chuyển khoản trả nhà cung cấp 8.000.000đ rồi đặt PAID: công nợ giảm 8.000.000đ. Nếu chọn nhầm nội dung phiếu thì không sửa được nữa, nên soát kỹ trước khi đặt PAID.",
  ),
  "workflow.guide.endUser.node.p2.explain": txt(
    "workflow.guide.endUser.node.p2.explain",
    "Nơi tập hợp chi phí vận hành của garage: khoản nhập tay, khoản lặp hàng tháng, hoa hồng, cùng khoản HHBH và vật tư tiêu hao do hệ thống tự ghi từ phiếu chi.",
  ),
  "workflow.guide.endUser.node.p2.example": txt(
    "workflow.guide.endUser.node.p2.example",
    "Tiền thuê mặt bằng 20.000.000đ nhập một lần và đặt lặp hàng tháng: mỗi tháng hệ thống tự có khoản này trong OPEX.",
  ),
  "workflow.guide.endUser.node.hh.explain": txt(
    "workflow.guide.endUser.node.hh.explain",
    "Phiếu chi nội dung 4 (HHBH) là chi phí bán hàng và không trừ công nợ. Khi phiếu ở trạng thái Đã duyệt hoặc Đã chi, hệ thống tự ghi một dòng OPEX và P&L đưa vào mục 4.2 Chi phí bán hàng.",
  ),
  "workflow.guide.endUser.node.hh.example": txt(
    "workflow.guide.endUser.node.hh.example",
    "Phiếu chi HHBH 1.500.000đ chuyển Đã duyệt: OPEX tự có dòng 1.500.000đ ở mục 4.2, còn công nợ phiếu dịch vụ không đổi.",
  ),
  "workflow.guide.endUser.node.vt.explain": txt(
    "workflow.guide.endUser.node.vt.explain",
    "Phiếu chi nội dung 10 mua vật tư dùng trong xưởng (dầu mỡ, giẻ lau, sơn...). Phiếu không trừ công nợ. Khi Đã duyệt hoặc Đã chi, hệ thống ghi OPEX và P&L tính vào nhóm Giá vốn.",
  ),
  "workflow.guide.endUser.node.vt.example": txt(
    "workflow.guide.endUser.node.vt.example",
    "Phiếu chi 600.000đ mua dầu mỡ, nội dung 10, trạng thái Đã chi: OPEX có dòng 600.000đ và P&L tính vào Giá vốn của tháng.",
  ),
  "workflow.guide.endUser.node.d1.explain": txt(
    "workflow.guide.endUser.node.d1.explain",
    "Danh sách các khoản khách hàng và công ty bảo hiểm còn nợ, phân theo tuổi nợ (số ngày đã quá hạn).",
  ),
  "workflow.guide.endUser.node.d1.example": txt(
    "workflow.guide.endUser.node.d1.example",
    "Công ty bảo hiểm còn nợ 15.000.000đ đã 45 ngày, nằm ở nhóm tuổi nợ cao để kế toán đòi trước.",
  ),
  "workflow.guide.endUser.node.d2.explain": txt(
    "workflow.guide.endUser.node.d2.explain",
    "Quản lý hóa đơn bán ra (OUT) và mua vào (IN). Hóa đơn mua vào có thể cấn trừ công nợ phải trả nhà cung cấp.",
  ),
  "workflow.guide.endUser.node.d2.example": txt(
    "workflow.guide.endUser.node.d2.example",
    "Nhận hóa đơn mua phụ tùng 8.000.000đ của nhà cung cấp, kế toán cấn trừ hóa đơn vào công nợ phải trả của nhà cung cấp đó.",
  ),
  "workflow.guide.endUser.node.m1.explain": txt(
    "workflow.guide.endUser.node.m1.explain",
    "Thực thu trừ Thực chi trong kỳ. Dự thu và Dự chi chưa phải tiền thật nên không được tính.",
  ),
  "workflow.guide.endUser.node.m1.example": txt(
    "workflow.guide.endUser.node.m1.example",
    "Tháng này thực thu 120.000.000đ, thực chi 90.000.000đ: dòng tiền ròng 30.000.000đ. Dự thu còn lại chưa tính vào.",
  ),
  "workflow.guide.endUser.node.m2.explain": txt(
    "workflow.guide.endUser.node.m2.explain",
    "Báo cáo doanh thu và lãi gộp tính theo ngày hoàn thành của phiếu. Phiếu Hủy và phiếu đã xóa mềm bị loại khỏi báo cáo.",
  ),
  "workflow.guide.endUser.node.m2.example": txt(
    "workflow.guide.endUser.node.m2.example",
    "Xe hoàn thành 30/9 nhưng khách trả 5/10: doanh thu của phiếu vẫn nằm trong tháng 9. Phiếu Hủy không xuất hiện.",
  ),
  "workflow.guide.endUser.howToRead.b1ex": txt(
    "workflow.guide.endUser.howToRead.b1ex",
    "Muốn biết ai làm bước Thực chi, nhìn vào hàng Kế toán: chi tiền.",
  ),
  "workflow.guide.endUser.howToRead.b2ex": txt(
    "workflow.guide.endUser.howToRead.b2ex",
    "Thẻ Hệ thống sinh Dự thu nằm ở cột Kết thúc: việc này chỉ xảy ra khi phiếu đã Kết thúc.",
  ),
  "workflow.guide.endUser.howToRead.b3ex": txt(
    "workflow.guide.endUser.howToRead.b3ex",
    "Bắt đầu từ thẻ số 1 Tạo phiếu, đi tới số 4 Kết thúc, rồi số 5 Hệ thống sinh Dự thu.",
  ),
  "workflow.guide.endUser.howToRead.b4ex": txt(
    "workflow.guide.endUser.howToRead.b4ex",
    "Mũi tên A sinh Dự thu từ thẻ Kết thúc mà không ai phải tạo phiếu bằng tay.",
  ),
  "workflow.guide.endUser.howToRead.b5ex": txt(
    "workflow.guide.endUser.howToRead.b5ex",
    "Bật nút Luồng đọc dữ liệu để thấy các nét chấm từ Thực chi và Thực thu sang Dòng tiền ròng.",
  ),
  "workflow.guide.endUser.howToRead.b6ex": txt(
    "workflow.guide.endUser.howToRead.b6ex",
    "Phiếu giao xe xong được đặt Kết thúc (viền xanh); phiếu khách hủy được đặt Hủy (viền đỏ) và rời khỏi báo cáo.",
  ),
  "workflow.guide.endUser.money.dt.example": txt(
    "workflow.guide.endUser.money.dt.example",
    "Phiếu 5.200.000đ, khách cọc 2.000.000đ, giao xe 15/10: Dự thu 3.200.000đ hạn 22/10. Nếu phiếu bị chuyển khỏi Kết thúc, Dự thu này tự hủy.",
  ),
  "workflow.guide.endUser.money.t1.example": txt(
    "workflow.guide.endUser.money.t1.example",
    "Khách chuyển khoản 3.200.000đ, kế toán lập phiếu thu gắn phiếu dịch vụ: đây là thực thu và công nợ của phiếu về 0.",
  ),
  "workflow.guide.endUser.money.dc.example": txt(
    "workflow.guide.endUser.money.dc.example",
    "Phiếu chi trả nhà cung cấp phụ tùng 8.000.000đ đang chờ duyệt (PENDING): công nợ nhà cung cấp chưa giảm.",
  ),
  "workflow.guide.endUser.money.p1.example": txt(
    "workflow.guide.endUser.money.p1.example",
    "Chuyển khoản trả nhà cung cấp 8.000.000đ và đặt PAID: công nợ giảm 8.000.000đ, phiếu không đổi được loại nữa.",
  ),
  "workflow.guide.endUser.money.hh.example": txt(
    "workflow.guide.endUser.money.hh.example",
    "Phiếu chi HHBH 1.500.000đ chuyển Đã duyệt: OPEX có dòng 1.500.000đ ở mục 4.2 Chi phí bán hàng, công nợ phiếu dịch vụ không đổi.",
  ),
  "workflow.guide.endUser.money.vt.example": txt(
    "workflow.guide.endUser.money.vt.example",
    "Phiếu chi 600.000đ mua dầu mỡ (nội dung 10), Đã chi: OPEX có dòng 600.000đ, P&L tính vào Giá vốn.",
  ),
  "workflow.guide.endUser.money.opex.example": txt(
    "workflow.guide.endUser.money.opex.example",
    "Thuê mặt bằng 20.000.000đ nhập một lần và đặt lặp hàng tháng: mỗi tháng tự có dòng OPEX này.",
  ),
  "workflow.guide.endUser.flowExample.forecast": txt(
    "workflow.guide.endUser.flowExample.forecast",
    "Phiếu 5.200.000đ, cọc 2.000.000đ, Kết thúc lúc 15:40. Sau mốc đồng bộ 16:15, hệ thống tạo Dự thu 3.200.000đ hạn +7 ngày mà kế toán không phải làm gì.",
  ),
  "workflow.guide.endUser.flowExample.opex": txt(
    "workflow.guide.endUser.flowExample.opex",
    "Kế toán lưu phiếu chi vật tư tiêu hao 600.000đ ở trạng thái Đã duyệt: hệ thống tự thêm một dòng vào OPEX, không cần nhập lại.",
  ),
  "workflow.guide.endUser.flowExample.commission": txt(
    "workflow.guide.endUser.flowExample.commission",
    "Kế toán mở báo cáo P&L tháng 9: hệ thống tự tạo phiếu chi hoa hồng PENDING. Phiếu đã chi mà P&L tăng thì sinh thêm phiếu chênh lệch.",
  ),
  "workflow.guide.endUser.flowExample.receipt": txt(
    "workflow.guide.endUser.flowExample.receipt",
    "Kế toán lưu phiếu thu 1.200.000đ gắn phiếu dịch vụ: hệ thống tự cấn trừ vào phiếu và đặt lại Dự thu còn 2.000.000đ.",
  ),
  "workflow.guide.endUser.flowExample.manual": txt(
    "workflow.guide.endUser.flowExample.manual",
    "Cố vấn bấm Bắt đầu sửa rồi Hoàn tất; kế toán ghi nhận Chờ thu và Đã chi. Các bước này do người dùng thực hiện, hệ thống không tự làm.",
  ),
  "workflow.guide.endUser.rules.b1ex": txt(
    "workflow.guide.endUser.rules.b1ex",
    "Phiếu chi 8.000.000đ đã PAID nhưng chọn nhầm nội dung: không sửa được, nên soát nội dung trước khi chuyển PAID.",
  ),
  "workflow.guide.endUser.rules.b2ex": txt(
    "workflow.guide.endUser.rules.b2ex",
    "Phiếu dịch vụ 5.200.000đ có chi hoa hồng 500.000đ: công nợ phải thu của phiếu vẫn tính trên 5.200.000đ, hoa hồng không được trừ vào.",
  ),
  "workflow.guide.endUser.rules.b3ex": txt(
    "workflow.guide.endUser.rules.b3ex",
    "Khách đã trả đủ 5.200.000đ trước khi Kết thúc: còn phải thu bằng 0 nên không có Dự thu.",
  ),
  "workflow.guide.endUser.rules.b4ex": txt(
    "workflow.guide.endUser.rules.b4ex",
    "Phiếu Hủy 3.000.000đ không nằm trong doanh thu và lãi gộp của tháng.",
  ),
  "workflow.guide.endUser.rules.b5ex": txt(
    "workflow.guide.endUser.rules.b5ex",
    "Xe hoàn thành 30/9 thì doanh thu và lãi gộp của phiếu nằm trong tháng 9, dù khách trả tiền sang tháng 10.",
  ),
  "workflow.guide.endUser.rules.b6ex": txt(
    "workflow.guide.endUser.rules.b6ex",
    "Kết thúc phiếu lúc 15:40 mà muốn thấy ngay: bấm Đồng bộ tay thay vì chờ mốc 16:15.",
  ),
  "workflow.guide.endUser.rules.b7ex": txt(
    "workflow.guide.endUser.rules.b7ex",
    "Chưa mở báo cáo P&L thì chưa có phiếu hoa hồng PENDING của kỳ đó; mở lần đầu hệ thống mới tạo.",
  ),
  "workflow.guide.dev.moduleExample.activity": txt(
    "workflow.guide.dev.moduleExample.activity",
    "Phiếu mới không vào hệ thống: kiểm tra SyncCaseService, watermark updatedSince và biến ENABLE_CRON trước.",
  ),
  "workflow.guide.dev.moduleExample.hub": txt(
    "workflow.guide.dev.moduleExample.hub",
    "Dự thu không tự sinh khi phiếu Kết thúc: đọc CaseLifecycleHandler rồi GarageCaseForecastService.",
  ),
  "workflow.guide.dev.moduleExample.cashflow": txt(
    "workflow.guide.dev.moduleExample.cashflow",
    "Không đổi được loại phiếu chi PAID: quy tắc khóa nằm ở garage-cashflow-payment-rules.ts, GarageCashflowTransactionService áp dụng khi lưu.",
  ),
  "workflow.guide.dev.moduleExample.opex": txt(
    "workflow.guide.dev.moduleExample.opex",
    "HHBH đã duyệt mà không thấy trong OPEX: tra kgara_operating_expenses theo source_cashflow_voucher_id của phiếu chi.",
  ),
  "workflow.guide.dev.moduleExample.read": txt(
    "workflow.guide.dev.moduleExample.read",
    "Thêm báo cáo mới: đọc qua GarageDashboardService hoặc Ledger handlers, không ghi ngược vào bảng nguồn.",
  ),
  "workflow.guide.dev.flowExample.forecast": txt(
    "workflow.guide.dev.flowExample.forecast",
    "Phiếu 5.200.000đ, cọc 2.000.000đ chuyển sang mã 3. KgaraSyncScheduler chạy 16:15, SyncCaseService thấy đổi trạng thái, CaseLifecycleHandler gọi GarageCaseForecastService tạo phiếu thu EXPECTED 3.200.000đ trong kgara_cashflow_vouchers, hạn +7 ngày.",
  ),
  "workflow.guide.dev.flowExample.opex": txt(
    "workflow.guide.dev.flowExample.opex",
    "Kế toán lưu phiếu chi nội dung 10 (600.000đ, APPROVED) qua GarageCashflowTransactionService. CashflowSettleHandler ghi một dòng giá vốn vào kgara_operating_expenses với source_cashflow_voucher_id trỏ về phiếu.",
  ),
  "workflow.guide.dev.flowExample.commission": txt(
    "workflow.guide.dev.flowExample.commission",
    "Mở P&L tháng 9: GaragePnlService gọi PnlCommissionHandler (fire-and-forget) tạo phiếu chi hoa hồng PENDING và dòng OPEX hoa hồng. Phiếu đã PAID mà P&L tăng thì sinh phiếu delta, không sửa số tiền phiếu cũ.",
  ),
  "workflow.guide.dev.flowExample.receipt": txt(
    "workflow.guide.dev.flowExample.receipt",
    "Lưu phiếu thu 1.200.000đ gắn phiếu dịch vụ: hệ thống tạo cấn trừ trong kgara_case_settlements, rồi đặt lại Dự thu của phiếu còn 2.000.000đ.",
  ),
  "workflow.guide.dev.flowExample.manual": txt(
    "workflow.guide.dev.flowExample.manual",
    "Kế toán cấn trừ tay một khoản qua KgaraCaseFinancialController (HTTP) hoặc nhập tay chi phí qua GarageOpexService. Không có handler tự chạy trong luồng này.",
  ),
  "workflow.guide.dev.tables.cases.example": txt(
    "workflow.guide.dev.tables.cases.example",
    "Tìm phiếu đã Kết thúc: lọc tinh_trang_dich_vu = 3; phiếu Hủy có giá trị 9 và bị loại khỏi báo cáo.",
  ),
  "workflow.guide.dev.tables.settlements.example": txt(
    "workflow.guide.dev.tables.settlements.example",
    "Phiếu thu 1.200.000đ gắn phiếu dịch vụ tạo một dòng cấn trừ ở đây; phiếu Dự thu EXPECTED thì không.",
  ),
  "workflow.guide.dev.tables.vouchers.example": txt(
    "workflow.guide.dev.tables.vouchers.example",
    "Dự thu của một phiếu: voucherType = RECEIPT và paymentStatus = EXPECTED. Sau khi khách trả, phiếu thu mới không còn EXPECTED.",
  ),
  "workflow.guide.dev.tables.opex.example": txt(
    "workflow.guide.dev.tables.opex.example",
    "HHBH 1.500.000đ đã duyệt tạo một dòng ở đây, cột source_cashflow_voucher_id trỏ về phiếu chi gốc.",
  ),
  "workflow.guide.dev.mechanisms.b1ex": txt(
    "workflow.guide.dev.mechanisms.b1ex",
    "Triển khai môi trường mới mà không thấy phiếu mới: kiểm tra ENABLE_CRON trước tiên.",
  ),
  "workflow.guide.dev.mechanisms.b2ex": txt(
    "workflow.guide.dev.mechanisms.b2ex",
    "Phiếu bị xóa trên KGara: sau 2 lần sync liền không thấy thì bị xóa mềm; nếu KGara khôi phục, lần sync sau tự hiện lại.",
  ),
  "workflow.guide.dev.mechanisms.b3ex": txt(
    "workflow.guide.dev.mechanisms.b3ex",
    "Lưu phiếu chi bị lỗi giữa chừng thì cấn trừ và OPEX cũng không được ghi, vì cùng một transaction.",
  ),
  "workflow.guide.dev.mechanisms.b4ex": txt(
    "workflow.guide.dev.mechanisms.b4ex",
    "P&L tháng 9 mở lần đầu sinh hoa hồng 10.000.000đ; sau khi PAID mà P&L tăng 1.000.000đ thì sinh phiếu delta 1.000.000đ.",
  ),
  "workflow.guide.dev.mechanisms.b5ex": txt(
    "workflow.guide.dev.mechanisms.b5ex",
    "Phiếu CANCELLED 2.000.000đ không nằm trong Thực chi hay Dự chi của sổ quỹ.",
  ),
  "workflow.guide.dev.verify.b1ex": txt(
    "workflow.guide.dev.verify.b1ex",
    "Khi phiếu chuyển Kết thúc, kiểm tra kgara_cashflow_vouchers xem có hai phiếu EXPECTED cho cùng một phiếu dịch vụ không trước khi sửa luồng.",
  ),
  "workflow.guide.dev.verify.b2ex": txt(
    "workflow.guide.dev.verify.b2ex",
    "Cần hiển thị trạng thái Đang sửa thì dùng nhãn trong KgaraCaseStatusBadge, nhưng không viết logic nghiệp vụ dựa trên mã 0, 1, 2 vì chưa xác minh trong code.",
  ),
  "workflow.guide.dev.codeRefs.b1ex": txt(
    "workflow.guide.dev.codeRefs.b1ex",
    "Muốn biết handler nào chạy khi phiếu đổi trạng thái: bắt đầu từ garage-hub.service.ts.",
  ),
  "workflow.guide.dev.codeRefs.b2ex": txt(
    "workflow.guide.dev.codeRefs.b2ex",
    "Đổi cách tính số tiền hay hạn của Dự thu: bắt đầu đọc file này.",
  ),
  "workflow.guide.dev.codeRefs.b3ex": txt(
    "workflow.guide.dev.codeRefs.b3ex",
    "Thêm một nội dung phiếu chi mới không trừ công nợ: xem quy tắc trong file này trước.",
  ),
  "workflow.guide.dev.codeRefs.b4ex": txt(
    "workflow.guide.dev.codeRefs.b4ex",
    "Đổi giờ đồng bộ: sửa lịch trong scheduler; SKILL.md ghi các quy tắc đã chốt của module.",
  ),
};
