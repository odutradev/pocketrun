import { CheckIcon, CopyIcon, ReloadIcon, UploadIcon } from "@radix-ui/react-icons";

import { Column, Hint, Mono, Panel, PanelHeader, PanelTitle, SplitLayout } from "../../styles";
import { applyApplicationConfig, exportApplicationConfig } from "@actions/apps";
import { appConfigFileName, appConfigJsonSchema } from "@assets/data";
import { Actions, FieldList, LoaderBox } from "./styles";
import useJsonConfig from "@hooks/useJsonConfig";
import useClipboard from "@hooks/useClipboard";
import LinkButton from "@components/linkButton";
import IconButton from "@components/iconButton";
import JsonEditor from "@components/jsonEditor";
import useAppEditorPage from "../../hook";
import Loader from "@components/loader";
import Button from "@components/button";
import Alert from "@components/alert";

const JsonTab = () => {
  const { applicationId, application, handleRefresh } = useAppEditorPage();
  const { copy, isCopied } = useClipboard();
  const isPageApplication = Boolean(application?.pageId);

  const config = useJsonConfig({
    isEnabled: Boolean(applicationId),
    exportConfig: () => exportApplicationConfig(applicationId),
    applyConfig: (payload) => applyApplicationConfig(applicationId, payload),
    toConfig: (result) => result,
    onApplied: () => {
      handleRefresh();
    }
  });

  return (
    <SplitLayout>
      <Column>
        <Panel aria-labelledby="app-config-title">
          <PanelHeader>
            <PanelTitle id="app-config-title">Configuração em JSON</PanelTitle>
            <Actions>
              <IconButton label={isCopied("config") ? "JSON copiado" : "Copiar o JSON"} icon={isCopied("config") ? <CheckIcon /> : <CopyIcon />} size="sm" onClick={() => copy(config.text, "config")} />
              <Button size="sm" variant="secondary" leftIcon={<ReloadIcon />} onClick={config.reload} disabled={config.isApplying}>
                {config.isDirty ? "Descartar" : "Recarregar"}
              </Button>
              <Button size="sm" leftIcon={<UploadIcon />} onClick={config.apply} isLoading={config.isApplying} loadingLabel="Aplicando…" disabled={!config.isLoaded}>
                Aplicar
              </Button>
            </Actions>
          </PanelHeader>
          <Hint>
            Edite à mão ou cole um JSON gerado por uma IA e clique em Aplicar (ou Ctrl+S). Os tokens não aparecem aqui: o JSON só troca o cargo
            deles, pelo <Mono>id</Mono>.
          </Hint>
          {isPageApplication && (
            <Alert tone="neutral">
              Esta aplicação é de uma página. Os cargos também aparecem na aba Acesso e dados da página, onde cada PIN escolhe o seu.
            </Alert>
          )}
          {config.isLoaded ? (
            <JsonEditor
              value={config.text}
              label="Configuração da aplicação em JSON"
              fileName={appConfigFileName}
              schema={appConfigJsonSchema}
              onChange={config.setText}
              onSave={config.apply}
            />
          ) : (
            <LoaderBox>
              <Loader label="Carregando a configuração" isCentered />
            </LoaderBox>
          )}
        </Panel>
      </Column>
      <Column>
        <Panel>
          <PanelTitle>Campos</PanelTitle>
          <Hint>Cada campo é opcional: o que ficar de fora não muda. A lista de cargos é completa: um cargo que sair dela é apagado.</Hint>
          <FieldList>
            <dt>name, description</dt>
            <dd>Nome (até 100 caracteres) e descrição (até 500).</dd>
            <dt>allowedOrigins</dt>
            <dd>Sites que podem chamar a API pelo navegador. * libera qualquer site.</dd>
            <dt>allowNonBrowserRequests</dt>
            <dd>Aceita chamadas sem Origin, como servidores, scripts e apps.</dd>
            <dt>roles[]</dt>
            <dd>name, description, isOwnDocumentsOnly e rules com collection, operations (read, create, update, delete) e maxDocuments.</dd>
            <dt>tokens[]</dt>
            <dd>id e role. Troca o cargo dos tokens listados; os outros ficam como estão. Criar e revogar fica na aba Tokens.</dd>
            <dt>projectId, tokens[].name</dt>
            <dd>Só informativos: não mudam pelo JSON.</dd>
          </FieldList>
          <div>
            <LinkButton to="/docs#kv-config" variant="secondary" size="sm">
              Ver a documentação completa
            </LinkButton>
          </div>
        </Panel>
      </Column>
    </SplitLayout>
  );
};

export default JsonTab;
