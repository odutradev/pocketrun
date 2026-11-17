import { ArrowLeftIcon } from "@radix-ui/react-icons";

import ContentNavbar from "@components/contentNavbar";
import EmptyState from "@components/emptyState";
import LinkButton from "@components/linkButton";
import LinkForm from "./subcomponents/linkForm";
import Loader from "@components/loader";
import useLinkEditorPage from "./hook";
import { Container } from "./styles";

const LinkEditorPage = () => {
  const { linkId, link, groups, isLoading, hasFailed, handleGroupCreated } = useLinkEditorPage();
  const isEditing = Boolean(linkId);

  return (
    <Container>
      <ContentNavbar
        title={isEditing ? "Editar link" : "Novo link"}
        info="O slug é o endereço curto do link. Ele é único entre links e páginas, e aceita só letras minúsculas, números e hífen."
        actions={
          <LinkButton to="/links" leftIcon={<ArrowLeftIcon />}>
            Voltar
          </LinkButton>
        }
      />
      {isLoading && <Loader label="Carregando o link" isCentered />}
      {!isLoading && hasFailed && (
        <EmptyState
          title="Link indisponível"
          description="Não foi possível abrir este link. Ele pode ter sido excluído."
          actions={<LinkButton to="/links">Ir para os links</LinkButton>}
        />
      )}
      {!isLoading && !hasFailed && <LinkForm key={link?.id ?? "new"} link={link} groups={groups} onGroupCreated={handleGroupCreated} />}
    </Container>
  );
};

export default LinkEditorPage;
