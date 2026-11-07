import * as React from "react";
import { useCallback } from "react";
import { Layers, Smartphone, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { V2Button, V2Text, V2Badge, V2Panel } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";

export const V2WelcomePage: React.FC = () => {
  const { t } = useV2Translation();

  const handleExplore = useCallback(() => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/v2/sales-orders");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, []);

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
    <div className="mx-auto max-w-5xl space-y-6 py-2">
      <V2Panel className="p-6 sm:p-8 bg-card border-border shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <V2Badge
              variant="outline"
              size="sm"
              className="gap-1.5 font-semibold text-primary"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("v2.welcome.badgeReady", "Nền tảng V2 Sẵn sàng")}
            </V2Badge>
          </div>

          <V2Text
            as="h1"
            variant="h1"
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
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

          <div className="pt-2">
            <V2Button
              variant="default"
              size="sm"
              onClick={handleExplore}
              className="gap-2 text-xs"
              rightIcon={<ArrowRight size={14} />}
            >
              {t("v2.welcome.exploreBtn", "Khám phá giao diện V2")}
            </V2Button>
          </div>
        </div>
      </V2Panel>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <V2Panel
              key={feat.title}
              className="flex flex-col justify-between p-5 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <V2Badge variant="secondary" size="xs">
                    {feat.tag}
                  </V2Badge>
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
            </V2Panel>
          );
        })}
      </div>
    </div>
  );
};
