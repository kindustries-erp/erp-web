import { V2LoadingSize, type V2LoadingSizeType } from "../V2Loading.type";

export const SIZE_DIMENSIONS: Record<
  string,
  { width: number; height: number }
> = {
  [V2LoadingSize.XS]: { width: 16, height: 16 },
  [V2LoadingSize.SM]: { width: 20, height: 20 },
  [V2LoadingSize.MD]: { width: 32, height: 32 },
  [V2LoadingSize.LG]: { width: 48, height: 48 },
  [V2LoadingSize.XL]: { width: 64, height: 64 },
};

export function resolveDimensions(
  size: V2LoadingSizeType = V2LoadingSize.MD,
  aspectRatio: number = 1,
) {
  const base =
    SIZE_DIMENSIONS[size as string] ?? SIZE_DIMENSIONS[V2LoadingSize.MD];
  return {
    width: Math.round(base.width * aspectRatio),
    height: base.height,
  };
}
