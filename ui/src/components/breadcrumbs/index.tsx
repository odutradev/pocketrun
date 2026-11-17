import { Crumb, Current, Item, List } from "./styles";
import type { BreadcrumbsProps } from "./types";

// Caminho para páginas a mais de um nível do início.
const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <nav aria-label="Caminho">
    <List>
      {items.map((item, index) => (
        <Item key={item.label}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {item.to ? <Crumb to={item.to}>{item.label}</Crumb> : <Current aria-current="page">{item.label}</Current>}
        </Item>
      ))}
    </List>
  </nav>
);

export default Breadcrumbs;
