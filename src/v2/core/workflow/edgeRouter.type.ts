export interface RouteRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RoutePoint {
  x: number;
  y: number;
}

export type RouteSide = "top" | "right" | "bottom" | "left";

export interface RouteInput {
  /** Các thẻ cần tránh (không gồm thẻ nguồn và đích). */
  obstacles: RouteRect[];
  /** Vùng cho phép đi (khung canvas). */
  bounds: RouteRect;
  source: RouteRect;
  target: RouteRect;
}

export interface RouteResult {
  points: RoutePoint[];
  labelPoint: RoutePoint;
}
