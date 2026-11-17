import Breadcrumbs from "@components/breadcrumbs";
import CopyField from "@components/copyField";
import PageHeader from "@components/pageHeader";
import ToolSwitcher from "@components/toolSwitcher";

import useAppDetailsPage from "../../hook";
import { Container, Description, Meta } from "./styles";

const AppHeader: React.FC = () => {
  const { application } = useAppDetailsPage();
  if (!application) return null;

  return (
    <Container>
      <Breadcrumbs items={[{ label: "Aplicações", to: "/" }, { label: application.name }]} />
      <PageHeader title={application.name} actions={<ToolSwitcher active="data" />}>
        <Meta>
          <CopyField value={application.projectId} label="Project ID" />
          <Description>{application.description || "Sem descrição."}</Description>
        </Meta>
      </PageHeader>
    </Container>
  );
};

export default AppHeader;
