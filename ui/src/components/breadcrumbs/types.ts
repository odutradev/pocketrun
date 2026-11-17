export interface BreadcrumbItem {
  label: string;
  // Sem `to`, o item é a página atual.
  to?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}
