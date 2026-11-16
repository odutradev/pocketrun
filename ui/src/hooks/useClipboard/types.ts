export interface UseClipboardReturn {
  copy: (text: string, key?: string) => Promise<void>;
  isCopied: (key?: string) => boolean;
}
