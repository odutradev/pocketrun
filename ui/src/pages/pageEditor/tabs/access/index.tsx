import { CodeIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { Column, Container, Page, Toolbar, ToolbarText } from "./styles";
import SegmentedControl from "@components/segmentedControl";
import ProtectionPanel from "./subcomponents/protectionPanel";
import ConfigEditor from "./subcomponents/configEditor";
import AccessList from "./subcomponents/accessList";
import KvRequests from "./subcomponents/kvRequests";
import UsageGuide from "./subcomponents/usageGuide";
import DataPanel from "./subcomponents/dataPanel";
import Skeleton from "@components/skeleton";
import usePageEditorPage from "../../hook";
import KvRoles from "./subcomponents/kvRoles";

import type { SegmentedOption } from "@components/segmentedControl/types";
import type { PageDataView } from "@utils/types/sitePage";

const viewOptions: SegmentedOption<PageDataView>[] = [
  { value: "visual", label: "Visual", icon: <MixerHorizontalIcon /> },
  { value: "json", label: "JSON", icon: <CodeIcon /> }
];

const AccessTab = () => {
  const { sitePage, access, hasLoadedAccess, loadAccess } = usePageEditorPage();
  const [view, setView] = useState<PageDataView>("visual");

  useEffect(() => {
    if (!hasLoadedAccess) loadAccess();
  }, [hasLoadedAccess, loadAccess]);

  if (!sitePage || !hasLoadedAccess || !access) {
    return (
      <Container aria-busy="true">
        <Skeleton height="320px" radius="panel" />
        <Skeleton height="220px" radius="panel" />
      </Container>
    );
  }

  return (
    <Page>
      <Toolbar>
        <ToolbarText>Quem abre a página, com qual PIN, e o que cada um pode fazer com os dados.</ToolbarText>
        <SegmentedControl label="Modo de edição" options={viewOptions} value={view} onValueChange={setView} size="sm" />
      </Toolbar>
      {view === "json" ? (
        <ConfigEditor />
      ) : (
        <Container>
          <Column>
            <AccessList />
            <KvRoles />
            <KvRequests />
          </Column>
          <Column>
            <ProtectionPanel />
            <DataPanel />
            <UsageGuide />
          </Column>
        </Container>
      )}
    </Page>
  );
};

export default AccessTab;
