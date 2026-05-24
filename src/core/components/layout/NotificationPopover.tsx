import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";

export function NotificationPopover({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useT();

  return (
    <Popover
      content={
        <div className="w-72 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t("topbar.notifications.title")}
            </h3>
          </div>
          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-[color:var(--muted)] flex items-center justify-center mb-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-[color:var(--faint)]"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <p className="text-xs text-[color:var(--muted-fg)]">
              {t("topbar.notifications.empty")}
            </p>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
