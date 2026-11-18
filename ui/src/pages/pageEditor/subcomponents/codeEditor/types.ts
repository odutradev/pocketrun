import type { Ref } from "react";

export interface CodeEditorHandle {
  format: () => void;
  goToNextIssue: () => void;
}

export interface CodeEditorProps {
  ref?: Ref<CodeEditorHandle>;
  value: string;
  label: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onIssuesChange?: (count: number) => void;
}
