export type JsonPayload = Record<string, unknown>;

export interface UseJsonConfigOptions<TResult> {
  isEnabled: boolean;
  exportConfig: () => Promise<unknown>;
  applyConfig: (payload: JsonPayload) => Promise<TResult>;
  toConfig: (result: TResult) => unknown;
  onApplied?: (result: TResult) => void;
}

export interface UseJsonConfigReturn {
  text: string;
  isLoaded: boolean;
  isDirty: boolean;
  isApplying: boolean;
  setText: (text: string) => void;
  reload: () => Promise<void>;
  apply: () => void;
}
