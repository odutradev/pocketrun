import {
  CodeIcon,
  EnterFullScreenIcon,
  ExclamationTriangleIcon,
  ExitFullScreenIcon,
  ExternalLinkIcon,
  EyeOpenIcon,
  MagicWandIcon,
  ResetIcon,
  ViewVerticalIcon
} from "@radix-ui/react-icons";
import { useTheme } from "styled-components";
import { useEffect, useRef, useState } from "react";

import { Bar, BarGroup, Footer, FooterGroup, Frame, Hint, MessageField, Meter, MeterBar, MeterText, Pane, Panes, Status, Workbench } from "./styles";
import { formatBytes, publicLinkUrl, versionLabel } from "@utils/functions";
import { pageHtmlMaxBytes, pagePreviewDelay, pageVersionMessageMaxLength } from "@assets/config";
import SegmentedControl from "@components/segmentedControl";
import CodeEditor from "../../subcomponents/codeEditor";
import useMediaQuery from "@hooks/useMediaQuery";
import IconButton from "@components/iconButton";
import { updatePage } from "@actions/sitePages";
import usePageEditorPage from "../../hook";
import useAction from "@hooks/useAction";
import Button from "@components/button";
import Input from "@components/input";
import Badge from "@components/badge";

import type { PageDraft, PagePayload, SitePage } from "@utils/types/sitePage";
import type { CodeEditorHandle } from "../../subcomponents/codeEditor/types";
import type { SegmentedOption } from "@components/segmentedControl/types";
import type { EditorView } from "./types";

const viewOptions: SegmentedOption<EditorView>[] = [
  { value: "code", label: "Código", icon: <CodeIcon /> },
  { value: "preview", label: "Prévia", icon: <EyeOpenIcon /> },
  { value: "split", label: "Dividido", icon: <ViewVerticalIcon /> }
];

const toPayload = (sitePage: SitePage, draft: PageDraft): PagePayload => ({
  title: sitePage.title,
  slug: sitePage.slug,
  groupId: sitePage.groupId ?? "",
  mode: sitePage.mode,
  startsAt: sitePage.startsAt,
  endsAt: sitePage.endsAt,
  maxClicks: sitePage.maxClicks,
  html: draft.html,
  restoredFrom: draft.restoredFrom,
  message: draft.message.trim()
});

const EditorTab = () => {
  const { breakpoints } = useTheme();
  const isWide = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isCompact = !useMediaQuery(`(min-width: ${breakpoints.md})`);
  const { sitePage, draft, isDirty, draftSize, setDraftHtml, setDraftMessage, discardDraft, handlePageSaved } = usePageEditorPage();
  const [view, setView] = useState<EditorView>("split");
  const [isExpanded, setIsExpanded] = useState(false);
  const [issueCount, setIssueCount] = useState(0);
  const codeEditorRef = useRef<CodeEditorHandle>(null);
  const [previewHtml, setPreviewHtml] = useState(draft.html);
  const isOverLimit = draftSize > pageHtmlMaxBytes;
  const usedPercent = Math.min(100, Math.round((draftSize / pageHtmlMaxBytes) * 100));
  const activeView: EditorView = !isWide && view === "split" ? "code" : view;

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

  useEffect(() => {
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  if (!sitePage) return null;

  const handleSave = () => {
    if (!isDirty || isOverLimit || isPending) return;
    execute({ id: sitePage.id, data: toPayload(sitePage, draft) });
  };

  const remaining = pageHtmlMaxBytes - draftSize;
  const visibleOptions = isWide ? viewOptions : viewOptions.filter((option) => option.value !== "split");

  return (
    <Workbench $isExpanded={isExpanded} aria-label="Editor da página">
      <Bar>
        <BarGroup>
          <SegmentedControl label="Visualização" options={visibleOptions} value={activeView} onValueChange={setView} isIconOnly={isCompact} />
          <Status>
            <Badge isMono>v{versionLabel(sitePage.version)}</Badge>
            {isDirty && <Badge tone="warning">Não salvo</Badge>}
            {isDirty && draft.restoredFrom !== null && <Badge tone="accent">Restaurando a {versionLabel(draft.restoredFrom)}</Badge>}
          </Status>
        </BarGroup>
        <BarGroup>
          {isDirty && (
            <Button variant="ghost" size="sm" leftIcon={<ResetIcon />} onClick={discardDraft}>
              Descartar
            </Button>
          )}
          {isDirty && (
            <MessageField>
              <Input
                label="Mensagem da versão"
                isLabelHidden
                size="sm"
                placeholder="O que mudou? (opcional)"
                value={draft.message}
                maxLength={pageVersionMessageMaxLength}
                onChange={(event) => setDraftMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSave();
                }}
              />
            </MessageField>
          )}
          <Button size="sm" disabled={!isDirty || isOverLimit} isLoading={isPending} loadingLabel="Salvando…" onClick={handleSave}>
            Salvar {versionLabel(sitePage.version + 1)}
          </Button>
          {activeView !== "preview" && (
            <IconButton label="Formatar o HTML (Shift+Alt+F)" icon={<MagicWandIcon />} size="sm" onClick={() => codeEditorRef.current?.format()} />
          )}
          <IconButton
            label="Abrir a página publicada em nova aba"
            icon={<ExternalLinkIcon />}
            size="sm"
            onClick={() => window.open(publicLinkUrl(sitePage.slug), "_blank", "noopener,noreferrer")}
          />
          <IconButton
            label={isExpanded ? "Sair da tela cheia" : "Expandir para a tela cheia"}
            icon={isExpanded ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
            size="sm"
            onClick={() => setIsExpanded((current) => !current)}
          />
        </BarGroup>
      </Bar>
      <Panes $isSplit={activeView === "split"}>
        {activeView !== "preview" && (
          <Pane>
            <CodeEditor
              ref={codeEditorRef}
              value={draft.html}
              label="HTML da página"
              onChange={setDraftHtml}
              onSave={handleSave}
              onIssuesChange={setIssueCount}
            />
          </Pane>
        )}
        {activeView !== "code" && (
          <Pane $isPreview>
            <Frame title={`Prévia de ${sitePage.title}`} sandbox="allow-scripts allow-forms allow-popups allow-modals" srcDoc={previewHtml} />
          </Pane>
        )}
      </Panes>
      <Footer>
        <Meter>
          <MeterText $isOver={isOverLimit}>
            <strong>
              {formatBytes(draftSize)} de {formatBytes(pageHtmlMaxBytes)}
            </strong>
            {isOverLimit ? ` · passou ${formatBytes(-remaining)} do limite` : ` · faltam ${formatBytes(remaining)}`}
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
        <FooterGroup>
          {activeView !== "preview" && issueCount > 0 && (
            <Button variant="ghost" size="sm" leftIcon={<ExclamationTriangleIcon />} onClick={() => codeEditorRef.current?.goToNextIssue()}>
              {issueCount === 1 ? "1 aviso no HTML" : `${issueCount} avisos no HTML`}
            </Button>
          )}
          <Hint>{isExpanded ? "Ctrl+S salva · Shift+Alt+F formata · Esc sai da tela cheia" : "Ctrl+S salva · Shift+Alt+F formata"}</Hint>
        </FooterGroup>
      </Footer>
    </Workbench>
  );
};

export default EditorTab;
