import { createPortal } from "react-dom";
import { useDocumentDependencyStore } from "@/core/config/documentDependencyStore";
import { Button } from "@/shared/components/ui/Button";

export function DocumentDependencyModal() {
  const { isOpen, message, dependencies, closeModal } =
    useDocumentDependencyStore();

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 transition-all duration-300 flex items-center justify-center"
      style={{
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="bg-white border border-border/50 rounded-2xl shadow-xl p-6 w-full max-w-[400px]">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-slate-900">
            Không thể hủy chứng từ
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
          {message}
        </p>

        {dependencies.length > 0 && (
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 max-h-48 overflow-y-auto mb-6">
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              {dependencies.map((dep, i) => (
                <li key={i}>{dep}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="primary" size="md" onClick={closeModal}>
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
