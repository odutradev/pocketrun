import { CounterClockwiseClockIcon, EnterFullScreenIcon, ExitFullScreenIcon, RowsIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { useTheme } from "styled-components";
import { useEffect, useState } from "react";

import {
  Added,
  Bar,
  BarGroup,
  Body,
  Container,
  Footer,
  Item,
  ItemHeader,
  ItemLabel,
  ItemMeta,
  List,
  ListPanel,
  ListTitle,
  Removed,
  Stats,
  Title,
  Workbench
} from "./styles";
import { currentTimestamp, formatBytes, formatRelativeTime, versionLabel } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import DiffViewer from "../../subcomponents/diffViewer";
import useMediaQuery from "@hooks/useMediaQuery";
import IconButton from "@components/iconButton";
import EmptyState from "@components/emptyState";
import usePageEditorPage from "../../hook";
import Skeleton from "@components/skeleton";
import Button from "@components/button";
import Badge from "@components/badge";

import type { DiffStats } from "../../subcomponents/diffViewer/types";
import type { SegmentedOption } from "@components/segmentedControl/types";
import type { VersionComparison } from "@utils/types/sitePage";

const comparisonOptions: SegmentedOption<VersionComparison>[] = [
  { value: "previous", label: "Com a anterior" },
  { value: "draft", label: "Com o editor" }
];

const VersionsTab = () => {
  const { breakpoints } = useTheme();
  const isWide = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const {
    sitePage,
    draft,
    isDirty,
    versions,
    versionHtml,
    hasLoadedVersions,
    isVersionsLoading,
    selectedVersion,
    loadVersions,
    loadVersionHtml,
    handleVersionSelect,
    handleVersionRestore
  } = usePageEditorPage();
  const [comparison, setComparison] = useState<VersionComparison>("previous");
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<DiffStats | null>(null);
  const previousNumber = selectedVersion !== null && selectedVersion > 1 ? selectedVersion - 1 : null;

  useEffect(() => {
    if (!hasLoadedVersions) loadVersions();
  }, [hasLoadedVersions, loadVersions]);

  useEffect(() => {
    if (selectedVersion === null) return;
    loadVersionHtml(selectedVersion);
    if (previousNumber !== null) loadVersionHtml(previousNumber);
  }, [selectedVersion, previousNumber, loadVersionHtml]);

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

  if (!hasLoadedVersions && isVersionsLoading) {
    return (
      <Container aria-busy="true">
        <Skeleton height="320px" radius="panel" />
        <Skeleton height="520px" radius="panel" />
      </Container>
    );
  }

  if (versions.length === 0) {
    return (
      <EmptyState
        isCompact
        title="Nenhuma versão ainda"
        description="Cada vez que você salva o HTML no editor, uma versão nova fica guardada aqui: 1.0, 1.1, 1.2 e assim por diante."
      />
    );
  }

  const now = currentTimestamp();
  const selected = versions.find((version) => version.number === selectedVersion) ?? null;
  const selectedHtml = selectedVersion !== null ? versionHtml[selectedVersion] : undefined;
  const previousHtml = previousNumber !== null ? versionHtml[previousNumber] : "";
  const isComparingDraft = comparison === "draft";
  const original = isComparingDraft ? selectedHtml : previousHtml;
  const modified = isComparingDraft ? draft.html : selectedHtml;
  const isCurrent = selected?.number === sitePage.version;
  const isSplit = isSideBySide && (isWide || isExpanded);

  const getTitle = () => {
    if (!selected) return "Escolha uma versão";
    if (isComparingDraft) return `${selected.label} → editor`;
    return previousNumber !== null ? `${versionLabel(previousNumber)} → ${selected.label}` : `${selected.label} · primeira versão`;
  };

  const handleSelect = (number: number) => {
    setStats(null);
    handleVersionSelect(number);
  };

  const handleComparisonChange = (next: VersionComparison) => {
    setStats(null);
    setComparison(next);
  };

  return (
    <Container>
      <ListPanel>
        <ListTitle>{versions.length === 1 ? "1 versão" : `${versions.length} versões`}</ListTitle>
        <List aria-label="Versões da página">
          {versions.map((version) => {
            const isSelected = version.number === selectedVersion;
            const isLive = version.number === sitePage.version;
            return (
              <li key={version.id}>
                <Item type="button" $isSelected={isSelected} aria-pressed={isSelected} onClick={() => handleSelect(version.number)}>
                  <ItemHeader>
                    <ItemLabel>{version.label}</ItemLabel>
                    {isLive && <Badge tone="success" hasDot>No ar</Badge>}
                    {version.restoredFrom !== null && <Badge>Restaurada da {versionLabel(version.restoredFrom)}</Badge>}
                  </ItemHeader>
                  <ItemMeta>
                    {version.actor.name} · {formatRelativeTime(version.createdAt, now)} · {formatBytes(version.size)}
                  </ItemMeta>
                </Item>
              </li>
            );
          })}
        </List>
      </ListPanel>
      <Workbench $isExpanded={isExpanded} aria-label="Comparação de versões">
        <Bar>
          <BarGroup>
            <Title>{getTitle()}</Title>
            {isComparingDraft && isDirty && <Badge tone="warning">Editor não salvo</Badge>}
            {stats && (
              <Stats aria-label={`${stats.added} linhas entraram e ${stats.removed} saíram`}>
                <Added>+{stats.added}</Added>
                <Removed>−{stats.removed}</Removed>
              </Stats>
            )}
          </BarGroup>
          <BarGroup>
            <SegmentedControl label="Comparar" options={comparisonOptions} value={comparison} onValueChange={handleComparisonChange} />
            {(isWide || isExpanded) && (
              <IconButton
                label={isSideBySide ? "Mostrar em uma coluna" : "Mostrar lado a lado"}
                icon={isSideBySide ? <RowsIcon /> : <ViewVerticalIcon />}
                size="sm"
                onClick={() => setIsSideBySide((current) => !current)}
              />
            )}
            <IconButton
              label={isExpanded ? "Sair da tela cheia" : "Expandir para a tela cheia"}
              icon={isExpanded ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
              size="sm"
              onClick={() => setIsExpanded((current) => !current)}
            />
          </BarGroup>
        </Bar>
        <Body>
          {original === undefined || modified === undefined ? (
            <Skeleton height="100%" />
          ) : (
            <DiffViewer
              key={`${selectedVersion}-${comparison}`}
              original={original}
              modified={modified}
              label={`Diferenças: ${getTitle()}`}
              isSideBySide={isSplit}
              onStatsChange={setStats}
            />
          )}
        </Body>
        <Footer>
          <span>Verde entrou, vermelho saiu. Restaurar leva o código para o editor; ao salvar, ele vira uma versão nova.</span>
          {selected && (
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<CounterClockwiseClockIcon />}
              disabled={isCurrent && !isDirty}
              onClick={() => handleVersionRestore(selected.number)}
            >
              Restaurar a {selected.label}
            </Button>
          )}
        </Footer>
      </Workbench>
    </Container>
  );
};

export default VersionsTab;
