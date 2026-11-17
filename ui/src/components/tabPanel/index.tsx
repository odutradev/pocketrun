import { getTabIds } from "@utils/functions";

import { Panel } from "./styles";
import type { TabPanelProps } from "./types";

const TabPanel = ({ idPrefix, value, children }: TabPanelProps) => {
  const { tabId, panelId } = getTabIds(idPrefix, value);

  return (
    <Panel id={panelId} role="tabpanel" aria-labelledby={tabId} tabIndex={0}>
      {children}
    </Panel>
  );
};

export default TabPanel;
