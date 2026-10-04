import * as React from "react";
import {
  Layers,
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/v2/shared/ui/button";
import { Badge } from "@/v2/shared/ui/badge";

export const V2WelcomePage: React.FC = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Platform Split Tự Động",
      desc: "Chuyển đổi linh hoạt giao diện chuyên biệt cho Desktop và Mobile.",
      tag: "Responsive",
    },
    {
      icon: Layers,
      title: "5 Tầng Atomic Design",
      desc: "Kiến trúc mô-đun hóa nghiêm ngặt, khống chế kích thước file < 180 LoC.",
      tag: "Architecture",
    },
    {
      icon: ShieldCheck,
      title: "Dual-Run Song Song",
      desc: "Hoạt động độc lập tại /v2/*, bảo vệ 100% độ ổn định của hệ thống V1.",
      tag: "Stability",
    },
    {
      icon: Zap,
      title: "Co-located Testing",
      desc: "100% thành phần đều có unit test tự động bảo đảm chất lượng code.",
      tag: "Quality Gate",
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
              Nền tảng V2 Sẵn sàng
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Khung Ứng Dụng Liouni ERP V2
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Hạ tầng v2/app đã hoàn thiện với đầy đủ Providers, Layout Switcher
            (Desktop & Mobile), Primitives Shadcn và cơ chế Dual-Run an toàn
            tuyệt đối.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="default"
              onClick={() => {
                const aside = document.querySelector("aside");
                if (aside) aside.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs"
            >
              <span>Khám phá menu điều hướng</span>
              <ArrowRight size={14} />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                window.location.href = "/";
              }}
              className="gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Về phiên bản ERP V1</span>
              <ExternalLink size={14} />
            </Button>
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
                <h2 className="text-sm font-bold text-foreground">
                  {feat.title}
                </h2>
                <p className="text-xs text-muted-foreground leading-normal">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
