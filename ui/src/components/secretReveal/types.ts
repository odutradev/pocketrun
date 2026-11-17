export interface SecretRevealProps {
  secret: string;
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
}
