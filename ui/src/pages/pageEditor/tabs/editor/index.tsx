import { ExternalLinkIcon, ResetIcon } from "@radix-ui/react-icons";
import { useTheme } from "styled-components";
import { useEffect, useState } from "react";

import { Container, Frame, Meter, MeterBar, MeterText, PreviewPanel, PreviewTitle, Status, Toolbar, ToolbarActions, Workspace } from "./styles";
import { formatBytes, publicLinkUrl, versionLabel } from "@utils/functions";
import { pageHtmlMaxBytes, pagePreviewDelay } from "@assets/config";
import SegmentedControl from "@components/segmentedControl";
import CodeEditor from "../../subcomponents/codeEditor";
import useMediaQuery from "@hooks/useMediaQuery";
import { updatePage } from "@actions/sitePages";
import usePageEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Badge from "@components/badge";

import type { PagePayload, SitePage } from "@utils/types/sitePage";
import type { SegmentedOption } from "@components/segmentedControl/types";
import type { EditorPane } from "./types";

const paneOptions: SegmentedOption<EditorPane>[] = [
  { value: "code", label: "Código" },
  { value: "preview", label: "Prévia" }
];

const toPayload = (sitePage: SitePage, html: string, restoredFrom: number | null): PagePayload => ({
  title: sitePage.title,
  slug: sitePage.slug,
  groupId: sitePage.groupId ?? "",
  mode: sitePage.mode,
  startsAt: sitePage.startsAt,
  endsAt: sitePage.endsAt,
  maxClicks: sitePage.maxClicks,
  html,
  restoredFrom
});

const EditorTab = () => {
  const { breakpoints } = useTheme();
  const isWide = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const { sitePage, draft, isDirty, draftSize, setDraftHtml, discardDraft, handlePageSaved } = usePageEditorPage();
  const [pane, setPane] = useState<EditorPane>("code");
  const [previewHtml, setPreviewHtml] = useState(draft.html);
  const isOverLimit = draftSize > pageHtmlMaxBytes;
  const usedPercent = Math.min(100, Math.round((draftSize / pageHtmlMaxBytes) * 100));

  const { execute, isPending } = useAction({
    action: (payload: { id: string; data: PagePayload }) => updatePage(payload.id, payload.data),
    toastMessages: {
      pending: "Publicando a nova versão…",
      success: "Nova versão publicada",
      error: "Não foi possível salvar a página"
    },
    callback: handlePageSaved
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => setPreviewHtml(draft.html), pagePreviewDelay);
    return () => window.clearTimeout(timeout);
  }, [draft.html]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (!sitePage) return null;

  const handleSave = () => {
    if (!isDirty || isOverLimit || isPending) return;
    execute({ id: sitePage.id, data: toPayload(sitePage, draft.html, draft.restoredFrom) });
  };

  const remaining = pageHtmlMaxBytes - draftSize;
  const showCode = isWide || pane === "code";
  const showPreview = isWide || pane === "preview";

  return (
    <Container>
      <Toolbar>
        <Status>
          <Badge isMono>Versão {versionLabel(sitePage.version)}</Badge>
          {isDirty && <Badge tone="warning">Alterações não salvas</Badge>}
          {isDirty && draft.restoredFrom !== null && <Badge tone="accent">Restaurando a {versionLabel(draft.restoredFrom)}</Badge>}
        </Status>
        <ToolbarActions>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ExternalLinkIcon />}
            onClick={() => window.open(publicLinkUrl(sitePage.slug), "_blank", "noopener,noreferrer")}
          >
            Abrir página
          </Button>
          {isDirty && (
            <Button variant="secondary" size="sm" leftIcon={<ResetIcon />} onClick={discardDraft}>
              Descartar
            </Button>
          )}
          <Button size="sm" disabled={!isDirty || isOverLimit} isLoading={isPending} loadingLabel="Salvando…" onClick={handleSave}>
            Salvar versão {versionLabel(sitePage.version + 1)}
          </Button>
        </ToolbarActions>
      </Toolbar>
      <Meter>
        <MeterText $isOver={isOverLimit}>
          <strong>
            {formatBytes(draftSize)} de {formatBytes(pageHtmlMaxBytes)}
          </strong>
          <span>
            {isOverLimit
              ? `Passou ${formatBytes(-remaining)} do limite. Reduza o HTML para salvar.`
              : `Faltam ${formatBytes(remaining)} para o limite.`}
          </span>
        </MeterText>
        <MeterBar
          $isOver={isOverLimit}
          role="progressbar"
          aria-valuenow={usedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tamanho do HTML usado"
        >
          <span style={{ width: `${usedPercent}%` }} />
        </MeterBar>
      </Meter>
      {!isWide && <SegmentedControl label="Mostrar" options={paneOptions} value={pane} onValueChange={setPane} isFullWidth />}
      <Workspace>
        {showCode && <CodeEditor value={draft.html} label="HTML da página" onChange={setDraftHtml} onSave={handleSave} />}
        {showPreview && (
          <PreviewPanel>
            <PreviewTitle>Prévia</PreviewTitle>
            <Frame
              title={`Prévia de ${sitePage.title}`}
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
              srcDoc={previewHtml}
            />
          </PreviewPanel>
        )}
      </Workspace>
    </Container>
  );
};

export default EditorTab;
