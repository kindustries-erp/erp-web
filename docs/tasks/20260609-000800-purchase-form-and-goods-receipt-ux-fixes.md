# Purchase form + goods receipt UX fixes

## User feedback
1. Mua hàng drawer quá hẹp; card Thông tin chung và Dòng chứng từ nên xếp dọc; mỗi dòng chứng từ nên hiển thị ngang và cho scroll ngang nếu chật. `Tên snapshot` gây confuse. Khi bấm chỉnh sửa Mua hàng thì detail không load đủ như bấm Chi tiết.
2. Goods Receipt form không hiện mặt hàng của từng dòng; cần rõ logic chọn PO nào được hiện trong combobox.

## Planned fixes
- Widen purchase drawer, stack sections vertically, horizontal row layout for lines with overflow-x.
- Hide/remove confusing snapshot field for purchase flow and prefer supplier lookup.
- Make edit flow fetch full detail before opening purchase form.
- Goods receipt: show item code/name/description per line, and filter PO options to actionable purchase orders only (exclude DRAFT/CANCELLED/fully received).
- When loading PO into GR form, only bring open quantities.
