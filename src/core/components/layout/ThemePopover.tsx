import { useAppStore, AppTheme } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { Popover } from "@/core/components/ui/Popover";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";

const THEME_OPTIONS: {
  value: AppTheme;
  labelKey: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "shell",
    labelKey: "nav.bottom.themeShell",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="9" y1="8" x2="21" y2="8" />
      </svg>
    ),
  },
  {
    value: "classic",
    labelKey: "nav.bottom.themeClassic",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <line x1="3" y1="8" x2="21" y2="8" />
        <line x1="9" y1="8" x2="9" y2="21" />
      </svg>
    ),
  },
  {
    value: "orca",
    labelKey: "nav.bottom.themeOrca",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="9" y1="7" x2="21" y2="7" />
        <line x1="9" y1="11" x2="21" y2="11" />
      </svg>
    ),
  },
];

export function ThemePopover({ children }: { children: React.ReactNode }) {
  const { appTheme, setAppTheme } = useAppStore();
  const t = useT();

  return (
    <Popover
      content={
        <div className="w-48 p-1.5">
          <p className="px-2.5 py-1.5 text-[11px] font-medium text-[color:var(--muted-fg)] uppercase tracking-wide">
            {t("nav.bottom.themeStyle")}
          </p>
          {THEME_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant="ghost"
              size="sm"
              onClick={() => setAppTheme(opt.value)}
              className={cn(
                "w-full justify-start gap-2.5 px-2.5 py-2",
                appTheme === opt.value
                  ? "bg-[color:var(--popup-bg-hover)] text-foreground font-medium"
                  : "text-[color:var(--muted-fg)] hover:bg-[color:var(--popup-bg-hover)] hover:text-foreground",
              )}
            >
              <span className="flex-shrink-0 opacity-70">{opt.icon}</span>
              <span>{t(opt.labelKey)}</span>
              {appTheme === opt.value && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="ml-auto text-[color:var(--up-fg)]"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </Button>
          ))}
        </div>
      }
    >
      {children}
    </Popover>
  );
}
