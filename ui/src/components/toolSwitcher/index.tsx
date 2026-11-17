import { brandTools } from "@assets/data";

import { Item, List, Soon } from "./styles";
import type { ToolSwitcherProps } from "./types";

const ToolSwitcher = ({ active }: ToolSwitcherProps) => (
  <List aria-label="Ferramentas da aplicação">
    {brandTools.map((tool) => (
      <Item key={tool.tool} aria-current={tool.tool === active ? "page" : undefined} $isActive={tool.tool === active}>
        {tool.name}
        {tool.status === "planned" && <Soon>em breve</Soon>}
      </Item>
    ))}
  </List>
);

export default ToolSwitcher;
