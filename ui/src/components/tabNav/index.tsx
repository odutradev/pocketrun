import type { KeyboardEvent } from "react";

import { getTabIds } from "@utils/functions";

import { Count, List, Tab } from "./styles";
import type { TabNavProps } from "./types";

// Abas sublinhadas. As setas, Home e End movem o foco entre elas, como pede o padrão de abas.
const TabNav = <TValue extends string>({
  label,
  idPrefix,
  items,
  value,
  onValueChange
}: TabNavProps<TValue>): React.ReactElement => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = items.findIndex((item) => item.value === value);
    const targets: Record<string, number> = {
      ArrowRight: (currentIndex + 1) % items.length,
      ArrowLeft: (currentIndex - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1
    };
    const nextIndex = targets[event.key];
    if (nextIndex === undefined) return;

    event.preventDefault();
    const nextValue = items[nextIndex].value;
    onValueChange(nextValue);
    document.getElementById(getTabIds(idPrefix, nextValue).tabId)?.focus();
  };

  return (
    <List role="tablist" aria-label={label} onKeyDown={handleKeyDown}>
      {items.map((item) => {
        const isActive = item.value === value;
        const { tabId, panelId } = getTabIds(idPrefix, item.value);

        return (
          <Tab
            key={item.value}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(item.value)}
            $isActive={isActive}
            $isDanger={Boolean(item.isDanger)}
          >
            {item.label}
            {item.count !== undefined && <Count>{item.count}</Count>}
          </Tab>
        );
      })}
    </List>
  );
};

export default TabNav;
