import { CheckIcon, CopyIcon, ReloadIcon, UploadIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "styled-components";
import Editor from "@monaco-editor/react";
import { toast } from "react-toastify";

import { Actions, Column, Container, Hint, Mono, Panel, PanelHeader, PanelTitle } from "../../styles";
import { defineEditorTheme, editorThemeName } from "../../../../subcomponents/codeEditor/setup";
import { createLocalLogger, getErrorMessage } from "@utils/functions";
import { pageConfigFileName, pageConfigJsonSchema } from "@assets/data";
import { EditorBox, FieldList, IssuedItem, IssuedList } from "./styles";
import { applyPageConfig, exportPageConfig } from "@actions/sitePages";
import usePageEditorPage from "../../../../hook";
import useClipboard from "@hooks/useClipboard";
import LinkButton from "@components/linkButton";
import IconButton from "@components/iconButton";
import useAction from "@hooks/useAction";
import Loader from "@components/loader";
import Button from "@components/button";
import Alert from "@components/alert";

import type { PageConfigIssuedPin, PageConfigPayload } from "@utils/types/sitePage";
import type { Monaco } from "@monaco-editor/react";

const logger = createLocalLogger("pageConfigEditor");

const format = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const parseConfig = (text: string): PageConfigPayload | null => {
  try {
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error("not an object");
    return parsed as PageConfigPayload;
  } catch (error) {
    logger.warn(error);
    toast.error("O JSON está malformado. Confira vírgulas, aspas e chaves antes de aplicar.");
    return null;
  }
};

const ConfigEditor = () => {
  const { brand } = useTheme();
  const { sitePage, reloadAccessData } = usePageEditorPage();
  const [loaded, setLoaded] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [issued, setIssued] = useState<PageConfigIssuedPin[]>([]);
  const { copy, isCopied } = useClipboard();
  const pageId = sitePage?.id ?? "";
  const isDirty = loaded !== null && text !== loaded;

  const show = useCallback((value: unknown) => {
    setLoaded(format(value));
    setText(format(value));
  }, []);

  const load = useCallback(
    () =>
      exportPageConfig(pageId)
        .then(show)
        .catch((error: unknown) => {
          logger.error(error);
          toast.error(getErrorMessage(error, "Não foi possível carregar a configuração"));
        }),
    [pageId, show]
  );

  useEffect(() => {
    if (pageId) load();
  }, [pageId, load]);

  const apply = useAction({
    action: (payload: PageConfigPayload) => applyPageConfig(pageId, payload),
    toastMessages: { pending: "Aplicando a configuração…", success: "Configuração aplicada", error: "Não foi possível aplicar a configuração" },
    callback: (result) => {
      show(result.config);
      setIssued(result.issued);
      reloadAccessData();
    }
  });

  const handleApply = () => {
    const payload = parseConfig(text);
    if (payload) apply.execute(payload);
  };

  const applyRef = useRef(handleApply);

  useEffect(() => {
    applyRef.current = handleApply;
  });

  const prepare = (instance: Monaco) => {
    defineEditorTheme(instance, brand);
    instance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [{ uri: "https://pocketrun.local/page-config.schema.json", fileMatch: [pageConfigFileName], schema: pageConfigJsonSchema }]
    });
  };

  return (
    <Container>
      <Column>
        <Panel aria-labelledby="page-config-title">
          <PanelHeader>
            <PanelTitle id="page-config-title">Configuração em JSON</PanelTitle>
            <Actions>
              <IconButton label={isCopied("config") ? "JSON copiado" : "Copiar o JSON"} icon={isCopied("config") ? <CheckIcon /> : <CopyIcon />} size="sm" onClick={() => copy(text, "config")} />
              <Button size="sm" variant="secondary" leftIcon={<ReloadIcon />} onClick={load} disabled={apply.isPending}>
                {isDirty ? "Descartar" : "Recarregar"}
              </Button>
              <Button size="sm" leftIcon={<UploadIcon />} onClick={handleApply} isLoading={apply.isPending} loadingLabel="Aplicando…" disabled={loaded === null}>
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
          <EditorBox>
            {loaded === null ? (
              <Loader label="Carregando a configuração" isCentered />
            ) : (
              <Editor
                value={text}
                path={pageConfigFileName}
                language="json"
                theme={editorThemeName}
                loading={<Loader label="Carregando o editor" isCentered />}
                beforeMount={prepare}
                onMount={(mounted, instance) => mounted.addCommand(instance.KeyMod.CtrlCmd | instance.KeyCode.KeyS, () => applyRef.current())}
                onChange={(next) => setText(next ?? "")}
                options={{
                  ariaLabel: "Configuração de acesso e dados em JSON",
                  automaticLayout: true,
                  fontFamily: brand.fonts.mono,
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  tabSize: 2,
                  wordWrap: "on"
                }}
              />
            )}
          </EditorBox>
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
