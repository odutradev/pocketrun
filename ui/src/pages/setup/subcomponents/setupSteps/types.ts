export type SetupStepState = "done" | "current" | "next";

export interface SetupStep {
  label: string;
  state: SetupStepState;
}
