import { ExternalLinkIcon, LightningBoltIcon, LinkBreak2Icon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Actions, Hint, Mono, Panel, PanelHeader, PanelTitle, Rules } from "../../styles";
import { enablePageKv, removePageKv } from "@actions/sitePages";
import ConfirmDialog from "@components/confirmDialog";
import usePageEditorPage from "../../../../hook";
import LinkButton from "@components/linkButton";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Alert from "@components/alert";
import Badge from "@components/badge";

const DataPanel = () => {
  const { sitePage, kv, handleKvChange } = usePageEditorPage();
  const [isRemoving, setIsRemoving] = useState(false);
  const pageId = sitePage?.id ?? "";
  const application = kv?.application ?? null;
  const isLinked = Boolean(kv?.binding);
  const isLegacy = Boolean(application) && !application?.pageId;

  const enable = useAction({
    action: () => enablePageKv(pageId),
    toastMessages: { pending: "Ativando os dados…", success: "Dados ativados", error: "Não foi possível ativar os dados" },
    callback: handleKvChange
  });

  const remove = useAction({
    action: () => removePageKv(pageId),
    toastMessages: { pending: "Desativando os dados…", success: "Dados desativados", error: "Não foi possível desativar os dados" },
    callback: () => {
      setIsRemoving(false);
      handleKvChange({ binding: null, application: null });
    }
  });

  return (
    <Panel aria-labelledby="page-data-title">
      <PanelHeader>
        <PanelTitle id="page-data-title">Dados do KV</PanelTitle>
        {isLinked ? (
          <Badge tone="success" hasDot>
            Ativados
          </Badge>
        ) : (
          <Badge>Desativados</Badge>
        )}
      </PanelHeader>
      {!isLinked && (
        <>
          <Hint>
            Ative para a página ler e gravar dados com <Mono>pocketrun.kv</Mono>, numa aplicação do KV só dela:
          </Hint>
          <Rules>
            <li>
              Três cargos prontos para todas as coleções: <strong>leitura</strong>, <strong>escrita</strong> e <strong>gestao</strong>, que você
              edita aqui mesmo.
            </li>
            <li>Quem abre sem PIN fica com leitura, e cada PIN com escrita. Troque na lista de quem abre a página.</li>
            <li>Nenhum token é criado: os dados só são usados pela página.</li>
          </Rules>
          <Actions>
            <Button leftIcon={<LightningBoltIcon />} onClick={() => enable.execute()} isLoading={enable.isPending} loadingLabel="Ativando…" disabled={!pageId}>
              Ativar dados
            </Button>
          </Actions>
        </>
      )}
      {isLinked && !application && <Alert tone="warning">A aplicação de dados desta página foi excluída. Desative e ative de novo para criar outra.</Alert>}
      {isLegacy && (
        <Alert tone="neutral">
          Esta página usa uma aplicação comum do KV, ligada antes de existir a aplicação própria. Os cargos dela são editados no KV. Desative e ative
          de novo para a página ganhar a dela.
        </Alert>
      )}
      {isLinked && application && (
        <Hint>
          {application.name} · <Mono>{application.projectId}</Mono>
        </Hint>
      )}
      {isLinked && (
        <Actions>
          {application && (
            <LinkButton to={`/kv/${application.id}/edit`} leftIcon={<ExternalLinkIcon />} variant="ghost">
              Ver documentos
            </LinkButton>
          )}
          <Button variant="secondary" leftIcon={<LinkBreak2Icon />} onClick={() => setIsRemoving(true)}>
            Desativar dados
          </Button>
        </Actions>
      )}
      <ConfirmDialog
        isOpen={isRemoving}
        onClose={() => setIsRemoving(false)}
        onConfirm={() => remove.execute()}
        isPending={remove.isPending}
        title="Desativar os dados?"
        description="A página perde o acesso aos dados na hora: as chamadas de pocketrun.kv passam a falhar. Os documentos e os cargos continuam na aplicação da página e voltam ao ativar de novo. Eles só são apagados junto com a página."
        confirmLabel="Desativar"
      />
    </Panel>
  );
};

export default DataPanel;
