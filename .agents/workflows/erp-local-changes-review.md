---
description: Review thay đổi local (chưa commit) của erp-web theo module, trình bày thống kê bằng bảng và dẫn chiếu file, module tương ứng. Chỉ đọc.
model: claude-sonnet-5-5
effort: medium
---

# 🔎 `/erp-local-changes-review` — erp-web

Khuyến nghị: Sonnet 5.5, effort medium. Agent khác dùng model tương đương.

Workflow này xem lại những gì đang có trong thay đổi local của `erp/erp-web`. Kỹ năng chi tiết nằm ở skill `erp-local-changes-review`. Muốn kiểm tra thay đổi có tuân thủ `erp-ui-structure` không thì dùng `/erp-local-changes-audit`.

<!-- SHARED:BEGIN erp-local-changes -->
Chỉ đọc. Không sửa file, không commit, không push, không chạy migration hay lệnh ghi DB.

## Thu thập thay đổi local

Chạy trong đúng repo con (`erp-api` hoặc `erp-web`), không chạy ở workspace root:

1. `git status --short` để lấy danh sách file đổi, thêm, xóa, chưa theo dõi.
2. `git diff --stat` và `git diff --cached --stat` để có thống kê dòng thêm/bớt.
3. Đọc `git diff` theo từng module, không đọc toàn bộ diff trong một lần. Với file lớn, đọc theo khoảng dòng.
4. Ánh xạ mỗi file sang module: lấy tên thư mục module trong `src/` (API) hoặc `src/modules/`, `src/v2/modules/` (Web), rồi tìm `.agents/skills/modules/<module>/SKILL.md` tương ứng. Nếu không có skill module, ghi rõ "chưa có skill module".

## Bố cục báo cáo bắt buộc

Heading đánh số, sub-số. Thống kê luôn dùng bảng. Mọi phát hiện phải có link `[đường/dẫn/file.ts](đường/dẫn/file.ts#L10-L20)` và tên skill module tương ứng.

```markdown
# 1. Tổng quan thay đổi
## 1.1 Thống kê
| Repo | Module | File | + dòng | - dòng | Loại (M/A/D/?) |
| :--- | :--- | :--- | ---: | ---: | :---: |

## 1.2 Ánh xạ module
| Module | Skill module | File chính |
| :--- | :--- | :--- |

# 2. Phát hiện theo module
## 2.1 <tên module>
| Mức độ | File#dòng | Vấn đề | Đề xuất |
| :--- | :--- | :--- | :--- |

# 3. Rủi ro và tác động chéo API ↔ Web
- ...

# 4. Kết luận và bước tiếp theo
- ...
```

Mức độ: `Cao` (sai nghiệp vụ, mất dữ liệu, lộ bảo mật, vi phạm DB-first), `Trung bình` (vi phạm chuẩn cấu trúc, thiếu test), `Thấp` (đặt tên, comment, format).

## Quy tắc

- Chỉ kết luận từ mã đã đọc. Nếu chưa đọc đủ file, ghi "chưa kiểm" thay vì suy đoán.
- Không in giá trị từ file `.env` hay secret. Nếu cần E2E, nạp `E2E_PASSWORD` từ dòng `E2E_PASSWORD=` trong `erp/erp-api/.env` vào tiến trình chạy script, không in ra log, không ghi vào repo.
- Trước khi chạy bất kỳ lệnh đọc DB nào, chạy `SELECT current_database();` và báo tên DB.
- Lệnh `grep` trong shell agent có thể bỏ qua file bị `.gitignore`; khi cần quét đầy đủ, dùng `/usr/bin/grep`.
<!-- SHARED:END erp-local-changes -->

---

## Checklist riêng erp-web

- [ ] Component mới có file không vượt 180 dòng (cảnh báo) hoặc 250 dòng (chặn), trừ file `*.locale.ts`, `*.options.ts`, `*.config.ts`, `*.type.ts`, `*.data.ts`.
- [ ] Chuỗi hiển thị đi qua `t()`, không hardcode tiếng Việt hoặc tiếng Anh. Với V2, key có prefix `v2.`.
- [ ] Không dùng màu `blue-*`; dùng token ngữ cảnh.
- [ ] Server state dùng `@tanstack/react-query`, không `useEffect` + fetch thủ công.
- [ ] Zustand đọc bằng selector riêng lẻ.
- [ ] Bảng dùng `SpreadsheetPageTemplate` hoặc `V2StandardTable`; drawer kế thừa `StandardFormDrawer` hoặc `V2StandardDrawer`.
- [ ] Hành động hủy hoặc xóa có modal xác nhận.
- [ ] Logic mới có `.test.tsx` hoặc `.test.ts` đi kèm.

## Đầu ra

Trình bày theo bố cục trong khối dùng chung ở trên. Kết thúc bằng câu hỏi user muốn xử lý phát hiện nào. Không tự lập plan và không sửa code.
