import { Container, Description, Meta } from "./styles";
import ToolSwitcher from "@components/toolSwitcher";
import Breadcrumbs from "@components/breadcrumbs";
import PageHeader from "@components/pageHeader";
import CopyField from "@components/copyField";
import useAppDetailsPage from "../../hook";

const AppHeader = () => {
  const { application } = useAppDetailsPage();
  if (!application) return null;

  return (
    <Container>
      <Breadcrumbs items={[{ label: "KV", to: "/kv" }, { label: application.name }]} />
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
