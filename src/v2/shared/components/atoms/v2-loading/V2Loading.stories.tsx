import type { Meta } from "@storybook/react";
import React from "react";
import { V2Loading } from "./V2Loading";
import { V2LoadingVariant, V2LoadingSize } from "./V2Loading.type";

const meta: Meta<typeof V2Loading> = {
  title: "Components/Atoms/V2Loading",
  component: V2Loading,
  tags: ["autodocs"],
};
export default meta;

export const SupercarRoad = () => (
  <V2Loading
    variant={V2LoadingVariant.SUPERCAR_ROAD}
    size={V2LoadingSize.LG}
    text="Đang tăng tốc tải dữ liệu..."
  />
);

export const TailSpin = () => (
  <V2Loading
    variant={V2LoadingVariant.TAIL_SPIN}
    size={V2LoadingSize.MD}
    text="Đang tải..."
  />
);

export const ThreeDots = () => (
  <V2Loading
    variant={V2LoadingVariant.THREE_DOTS}
    size={V2LoadingSize.MD}
    text="Vui lòng chờ..."
  />
);

export const PulseBars = () => (
  <V2Loading
    variant={V2LoadingVariant.PULSE_BARS}
    size={V2LoadingSize.MD}
    text="Đang đồng bộ..."
  />
);

export const Ripple = () => (
  <V2Loading
    variant={V2LoadingVariant.RINGS}
    size={V2LoadingSize.MD}
    text="Đang kết nối..."
  />
);

export const Orbit = () => (
  <V2Loading
    variant={V2LoadingVariant.ORBIT}
    size={V2LoadingSize.MD}
    text="Đang khởi tạo hệ thống..."
  />
);

export const Grid = () => (
  <V2Loading
    variant={V2LoadingVariant.GRID}
    size={V2LoadingSize.MD}
    text="Đang tải ma trận dữ liệu..."
  />
);

export const AllCollectionShowcase = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-background rounded-lg border border-border">
    <V2Loading
      variant={V2LoadingVariant.SUPERCAR_ROAD}
      size={V2LoadingSize.LG}
      text="Ferrari 488 Road"
    />
    <V2Loading
      variant={V2LoadingVariant.TAIL_SPIN}
      size={V2LoadingSize.LG}
      text="Tail Spin"
    />
    <V2Loading
      variant={V2LoadingVariant.ORBIT}
      size={V2LoadingSize.LG}
      text="Orbit"
    />
    <V2Loading
      variant={V2LoadingVariant.THREE_DOTS}
      size={V2LoadingSize.LG}
      text="Three Dots"
    />
    <V2Loading
      variant={V2LoadingVariant.PULSE_BARS}
      size={V2LoadingSize.LG}
      text="Pulse Bars"
    />
    <V2Loading
      variant={V2LoadingVariant.RINGS}
      size={V2LoadingSize.LG}
      text="Rings"
    />
    <V2Loading
      variant={V2LoadingVariant.GRID}
      size={V2LoadingSize.LG}
      text="Grid"
    />
  </div>
);
