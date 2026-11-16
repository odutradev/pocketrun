export interface ToastMessages {
  pending: string;
  success: string;
  error: string;
}

export interface UseActionOptions<TArgs extends unknown[], TResult> {
  action: (...args: TArgs) => Promise<TResult>;
  toastMessages: ToastMessages;
  callback?: (result: TResult) => void;
}

export interface UseActionReturn<TArgs extends unknown[], TResult> {
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  isPending: boolean;
}
