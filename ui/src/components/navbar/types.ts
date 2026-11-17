export interface NavItem {
  label: string;
  to: string;
  // Prefixos de rota em que o item conta como ativo.
  matches: string[];
}
