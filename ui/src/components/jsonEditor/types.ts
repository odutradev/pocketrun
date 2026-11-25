export interface JsonEditorProps {
  value: string;
  label: string;
  fileName: string;
  schema: Record<string, unknown>;
  onChange: (value: string) => void;
  onSave: () => void;
}
