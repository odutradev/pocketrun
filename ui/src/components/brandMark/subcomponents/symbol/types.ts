import type { BrandContext, BrandTool, LogoPalette, SymbolMotion, SymbolPose, SymbolStatus, SymbolVariant } from "@utils/types/brand";

export type SymbolFrame = "tight" | "full";

export interface BrandSymbolProps {
  size: number;
  context?: BrandContext;
  palette?: LogoPalette;
  variant?: SymbolVariant;
  frame?: SymbolFrame;
  title?: string;
  pose?: SymbolPose;
  motion?: SymbolMotion;
  motionDelay?: number;
  bladeOrder?: BrandTool[];
  isStaggered?: boolean;
  snapKey?: number;
  status?: SymbolStatus;
}

export type SymbolMotionProps = Pick<BrandSymbolProps, "pose" | "motion" | "isStaggered" | "snapKey" | "status">;
