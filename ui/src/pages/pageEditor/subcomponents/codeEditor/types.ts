export interface CodeEditorProps {
  value: string;
  label: string;
  onChange: (value: string) => void;
  onSave: () => void;
}
