import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import { DEFAULT_META, META } from "@/modules/common/comingSoonMeta";

export function ComingSoon() {
  const t = useT();
  const { currentPage, locale } = useAppStore();
  const meta = META[currentPage] ?? DEFAULT_META;
  const isVi = locale === "vi";
  const name = isVi ? meta.nameVi : meta.nameEn;
  const desc = isVi ? meta.descVi : meta.descEn;
  const features = isVi ? meta.featuresVi : meta.featuresEn;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-112px)] overflow-hidden px-6 py-10">
      <ComingSoonBackground />
      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-xl w-full cs-fade-up">
        <OrbitIcon icon={meta.icon} />
        <div className="flex flex-col items-center gap-3">
          <span
            className="inline-flex items-center gap-[6px] px-3 py-[5px] rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{
              background: "var(--warn-bg)",
              color: "var(--warn-fg)",
              border: "1px solid var(--warn-fg)",
            }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full animate-pulse flex-shrink-0"
              style={{ background: "var(--warn-fg)" }}
            />
            {t("common.comingSoon")}
          </span>
          <h2 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
            {name}
          </h2>
          <p
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: "var(--muted-fg)" }}
          >
            {desc}
          </p>
        </div>
        {features.length > 0 && <FeatureGrid features={features} />}
      </div>
    </div>
  );
}

function ComingSoonBackground() {
  return (
    <>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          opacity: 0.7,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 42%, rgba(15,23,42,0.05) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

function OrbitIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
      <div
        className="cs-spin-slow absolute inset-0 rounded-full"
        style={{
          border: "1px dashed var(--border)",
          borderTopColor: "var(--faint)",
        }}
      />
      <div
        className="cs-spin-rev absolute"
        style={{
          inset: 16,
          borderRadius: "50%",
          border: "1px solid var(--border-light)",
          borderBottomColor: "var(--faint)",
        }}
      />
      <div
        className="cs-float relative w-16 h-16 rounded-2xl flex items-center justify-center text-[color:var(--primary-fg)]"
        style={{
          background: "var(--primary)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.10)",
        }}
      >
        {icon}
      </div>
      <div
        className="cs-spin-slow absolute"
        style={{ inset: 2, borderRadius: "50%" }}
      >
        <div
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: "var(--primary)",
            top: "50%",
            left: -4,
            marginTop: -4,
          }}
        />
      </div>
    </div>
  );
}

function FeatureGrid({ features }: { features: [React.ReactNode, string][] }) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-[480px]:grid-cols-1">
      {features.map(([icon, label], i) => (
        <div
          key={i}
          className="cs-fade-up flex flex-col items-center gap-3 rounded-xl p-4 text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
            animationDelay: `${0.15 + i * 0.08}s`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--muted)", color: "var(--muted-fg)" }}
          >
            {icon}
          </div>
          <span
            className="text-xs font-medium leading-snug"
            style={{ color: "var(--foreground)" }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
