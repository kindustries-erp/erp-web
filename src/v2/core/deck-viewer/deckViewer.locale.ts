import { registerV2ModuleLocale } from "@/v2/shared/locales";

registerV2ModuleLocale("deckViewer", {
  vi: {
    toggleSidebar: "Đóng/mở danh sách trang",
    prevPage: "Trang trước",
    nextPage: "Trang tiếp theo",
    downloadPdf: "Tải PDF",
    toggleFullscreen: "Toàn màn hình",
    pageList: "Danh sách trang",
    pagesCount: "Mục lục ({{count}} trang)",
    searchPlaceholder: "Tìm theo số hoặc tiêu đề...",
    noMatchingPages: "Không tìm thấy trang phù hợp",
    slideAriaLabel: "Trang {{page}}: {{title}}",
    notFoundTitle: "Không tìm thấy tài liệu trình chiếu",
    notFoundDesc: "Vui lòng kiểm tra lại đường dẫn hoặc cấu hình tài liệu.",
  },
  en: {
    toggleSidebar: "Toggle page sidebar",
    prevPage: "Previous page",
    nextPage: "Next page",
    downloadPdf: "Download PDF",
    toggleFullscreen: "Fullscreen",
    pageList: "Page list",
    pagesCount: "Contents ({{count}} pages)",
    searchPlaceholder: "Filter by page or title...",
    noMatchingPages: "No matching pages",
    slideAriaLabel: "Page {{page}}: {{title}}",
    notFoundTitle: "Presentation not found",
    notFoundDesc: "Please check the route or deck configuration.",
  },
});
