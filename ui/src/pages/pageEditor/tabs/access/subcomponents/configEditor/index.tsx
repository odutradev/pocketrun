import { CheckIcon, CopyIcon, ReloadIcon, UploadIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { Actions, Column, Container, Hint, Mono, Panel, PanelHeader, PanelTitle } from "../../styles";
import { pageConfigFileName, pageConfigJsonSchema } from "@assets/data";
import { applyPageConfig, exportPageConfig } from "@actions/sitePages";
import { FieldList, IssuedItem, IssuedList, LoaderBox } from "./styles";
import usePageEditorPage from "../../../../hook";
import useJsonConfig from "@hooks/useJsonConfig";
import useClipboard from "@hooks/useClipboard";
import LinkButton from "@components/linkButton";
import IconButton from "@components/iconButton";
import JsonEditor from "@components/jsonEditor";
import Loader from "@components/loader";
import Button from "@components/button";
import Alert from "@components/alert";

import type { PageConfigIssuedPin } from "@utils/types/sitePage";

const ConfigEditor = () => {
  const { sitePage, reloadAccessData } = usePageEditorPage();
  const [issued, setIssued] = useState<PageConfigIssuedPin[]>([]);
  const { copy, isCopied } = useClipboard();
  const pageId = sitePage?.id ?? "";

  const config = useJsonConfig({
    isEnabled: Boolean(pageId),
    exportConfig: () => exportPageConfig(pageId),
    applyConfig: (payload) => applyPageConfig(pageId, payload),
    toConfig: (result) => result.config,
    onApplied: (result) => {
      setIssued(result.issued);
      reloadAccessData();
    }
  });

  return (
    <Container>
      <Column>
        <Panel aria-labelledby="page-config-title">
          <PanelHeader>
            <PanelTitle id="page-config-title">Configuração em JSON</PanelTitle>
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
            Edite à mão ou cole um JSON gerado por uma IA. Os PINs não aparecem aqui: um PIN sem <Mono>pin</Mono> mantém o atual, e um PIN novo
            sem <Mono>pin</Mono> ganha um sorteado.
          </Hint>
          {issued.length > 0 && (
            <Alert tone="success" title="PINs sorteados">
              Copie e envie para quem vai abrir a página. Eles também ficam visíveis na lista do modo visual.
              <IssuedList>
                {issued.map((item) => (
                  <IssuedItem key={item.role}>
                    {item.role || "PIN geral"}: {item.pin}
                    <IconButton
                      size="sm"
                      label={isCopied(item.role) ? "PIN copiado" : `Copiar o PIN de ${item.role || "PIN geral"}`}
                      icon={isCopied(item.role) ? <CheckIcon /> : <CopyIcon />}
                      onClick={() => copy(item.pin, item.role)}
                    />
                  </IssuedItem>
                ))}
              </IssuedList>
            </Alert>
          )}
          {config.isLoaded ? (
            <JsonEditor
              value={config.text}
              label="Configuração de acesso e dados em JSON"
              fileName={pageConfigFileName}
              schema={pageConfigJsonSchema}
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
          <Hint>Cada bloco é opcional: o que ficar de fora não muda. As listas são completas: o que sair delas é apagado.</Hint>
          <FieldList>
            <dt>access.isEnabled</dt>
            <dd>Pede PIN para abrir. Ligar exige ao menos um PIN.</dd>
            <dt>access.sessionHours</dt>
            <dd>Horas que o acesso dura, de 1 a 720.</dd>
            <dt>access.pins[].role</dt>
            <dd>"" é o PIN geral. Outro nome é um PIN de cargo, como equipe.</dd>
            <dt>access.pins[].pin</dt>
            <dd>Opcional. 6 números sem sequência nem repetição.</dd>
            <dt>access.pins[].kvRole</dt>
            <dd>Cargo dos dados desse PIN: admin, um cargo de kv.roles ou "".</dd>
            <dt>kv.isEnabled</dt>
            <dd>Liga os dados da página. Desligar mantém documentos e cargos.</dd>
            <dt>kv.publicRole</dt>
            <dd>Cargo de quem abre sem PIN.</dd>
            <dt>kv.roles[]</dt>
            <dd>name, description, isOwnDocumentsOnly e rules com collection, operations (read, create, update, delete) e maxDocuments.</dd>
          </FieldList>
          <div>
            <LinkButton to="/docs#page-config" variant="secondary" size="sm">
              Ver a documentação completa
            </LinkButton>
          </div>
        </Panel>
      </Column>
    </Container>
  );
};

export default ConfigEditor;
