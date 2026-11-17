import { getTabIds } from "@utils/functions";

import { Panel } from "./styles";
import type { TabPanelProps } from "./types";

// Painel da aba ativa do tabNav, ligado a ela pelos ids.
const TabPanel: React.FC<TabPanelProps> = ({ idPrefix, value, children }) => {
  const { tabId, panelId } = getTabIds(idPrefix, value);

  return (
    <Panel id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0}>
      {children}
    </Panel>
  );
};

export default TabPanel;
