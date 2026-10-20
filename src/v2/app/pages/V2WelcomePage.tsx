import * as React from "react";
import {
  Layers,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { V2Button, V2Text } from "@/v2/shared/components/atoms";
import { Badge } from "@/v2/shared/ui";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export const V2WelcomePage: React.FC = () => {
  const { t } = useV2Translation();

  const features = [
    {
      icon: Smartphone,
      title: t("v2.welcome.featureSplitTitle", "Platform Split Tự Động"),
      desc: t(
        "v2.welcome.featureSplitDesc",
        "Chuyển đổi linh hoạt giao diện chuyên biệt cho Desktop và Mobile.",
      ),
      tag: t("v2.welcome.badgeResponsive", "Responsive"),
    },
    {
      icon: Layers,
      title: t("v2.welcome.featureAtomicTitle", "5 Tầng Atomic Design"),
      desc: t(
        "v2.welcome.featureAtomicDesc",
        "Kiến trúc mô-đun hóa nghiêm ngặt, khống chế kích thước file < 180 LoC.",
      ),
      tag: t("v2.welcome.badgeArchitecture", "Architecture"),
    },
    {
      icon: ShieldCheck,
      title: t("v2.welcome.featureDualRunTitle", "Dual-Run Song Song"),
      desc: t(
        "v2.welcome.featureDualRunDesc",
        "Hoạt động độc lập tại /v2/*, bảo vệ 100% độ ổn định của hệ thống V1.",
      ),
      tag: t("v2.welcome.badgeStability", "Stability"),
    },
    {
      icon: Zap,
      title: t("v2.welcome.featureTestingTitle", "Co-located Testing"),
      desc: t(
        "v2.welcome.featureTestingDesc",
        "100% thành phần đều có unit test tự động bảo đảm chất lượng code.",
      ),
      tag: t("v2.welcome.badgeQuality", "Quality Gate"),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-2">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 py-1 px-3 text-xs font-semibold text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("v2.welcome.badgeReady", "Nền tảng V2 Sẵn sàng")}
            </Badge>
          </div>

          <V2Text
            as="h1"
            variant="h1"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
          >
            {t("v2.welcome.heroTitle", "Khung Ứng Dụng ERP V2")}
          </V2Text>

          <V2Text
            variant="body"
            color="muted"
            className="text-sm sm:text-base leading-relaxed"
          >
            {t(
              "v2.welcome.heroSubtitle",
              "Kiến trúc giao diện mới với thiết kế 2-Card nổi (Floating Cards), Primitives Shadcn và cơ chế Dual-Run an toàn song song với V1.",
            )}
          </V2Text>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <V2Button
              variant="default"
              onClick={() => {
                const aside = document.querySelector("aside");
                if (aside) aside.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
              rightIcon={<ArrowRight size={14} />}
            >
              <span>{t("v2.welcome.exploreBtn", "Khám phá giao diện V2")}</span>
            </V2Button>

            <V2Button
              variant="outline"
              onClick={() => {
                window.location.href = "/";
              }}
              className="gap-2 text-xs text-muted-fg hover:text-foreground"
              rightIcon={<ExternalLink size={14} />}
            >
              <span>{t("v2.welcome.backV1Btn", "Quay lại ERP V1")}</span>
            </V2Button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-normal"
                  >
                    {feat.tag}
                  </Badge>
                </div>
                <V2Text as="h2" variant="h4" weight="bold">
                  {feat.title}
                </V2Text>
                <V2Text
                  variant="body-sm"
                  color="muted"
                  className="leading-normal"
                >
                  {feat.desc}
                </V2Text>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
