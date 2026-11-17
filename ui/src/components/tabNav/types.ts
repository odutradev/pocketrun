export interface TabNavItem<TValue extends string> {
  value: TValue;
  label: string;
  count?: number;
  // "Zona de perigo" fica sempre por último, em texto de erro.
  isDanger?: boolean;
}

export interface TabNavProps<TValue extends string> {
  // Nome da lista de abas para leitores de tela.
  label: string;
  // Prefixo dos ids que ligam aba e painel (veja `getTabIds`).
  idPrefix: string;
  items: TabNavItem<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
}
