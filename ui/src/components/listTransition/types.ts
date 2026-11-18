import type { ReactNode } from "react";

export interface ListTransitionProps {
  transitionKey: string | number;
  isBusy: boolean;
  children: ReactNode;
}

export interface SettledFrame {
  key: string | number;
  height: number;
}
