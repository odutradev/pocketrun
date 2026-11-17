export type SkeletonRadius = "small" | "control" | "panel" | "card" | "pill";

export interface SkeletonProps {
  width?: string;
  height: string;
  radius?: SkeletonRadius;
}
