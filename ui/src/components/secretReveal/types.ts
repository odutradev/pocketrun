export interface SecretRevealProps {
  secret: string;
  // Nome do segredo, como "Token de acesso".
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
}
