import type {
  BrandContext,
  BrandTool,
  LogoPalette,
  SymbolMotion,
  SymbolPose,
  SymbolStatus,
  SymbolVariant
} from "@utils/types/brand";

export type SymbolFrame = "tight" | "full";

export interface BrandSymbolProps {
  size: number;
  context?: BrandContext;
  palette?: LogoPalette;
  variant?: SymbolVariant;
  frame?: SymbolFrame;
  title?: string;
  // Posição das lâminas; trocar o valor anima a mudança.
  pose?: SymbolPose;
  // "intro" abre o canivete ao montar; "loop" abre e fecha sem parar.
  motion?: SymbolMotion;
  motionDelay?: number;
  bladeOrder?: BrandTool[];
  isStaggered?: boolean;
  // Cada incremento faz a lâmina de Dados dar um estalo.
  snapKey?: number;
  status?: SymbolStatus;
}

export type SymbolMotionProps = Pick<BrandSymbolProps, "pose" | "motion" | "isStaggered" | "snapKey" | "status">;
