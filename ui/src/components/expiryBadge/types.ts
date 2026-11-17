export interface ExpiryBadgeProps {
  expiresAt: string | null | undefined;
  // Texto quando não há data de expiração, como "Sem validade".
  noneLabel: string;
  // Mostra "Ativo" quando ainda falta muito para expirar; sem isso, a célula fica com a data.
  isStatus?: boolean;
}
