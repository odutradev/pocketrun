import { ArrowLeftIcon } from "@radix-ui/react-icons";

import ContentNavbar from "@components/contentNavbar";
import LinkButton from "@components/linkButton";
import CopyField from "@components/copyField";
import useAppDetailsPage from "../../hook";
import { Container } from "./styles";

const AppHeader = () => {
  const { application, isLoading, loadApplication } = useAppDetailsPage();
  if (!application) return null;

  return (
    <Container>
      <ContentNavbar
        title={application.name}
        info={application.description || "Aplicação do KV, sem descrição."}
        actions={
          <LinkButton to="/kv" leftIcon={<ArrowLeftIcon />}>
            KV
          </LinkButton>
        }
        onReload={() => loadApplication(application.id)}
        isReloading={isLoading}
      />
      <CopyField value={application.projectId} label="Project ID" />
    </Container>
  );
};

export default AppHeader;
