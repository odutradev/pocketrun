import { CounterClockwiseClockIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { Comparison, ComparisonHeader, ComparisonTitle, Container, Item, ItemMeta, ItemTitle, List, ListPanel, Note } from "./styles";
import { currentTimestamp, formatBytes, formatRelativeTime, versionLabel } from "@utils/functions";
import SegmentedControl from "@components/segmentedControl";
import DiffViewer from "../../subcomponents/diffViewer";
import EmptyState from "@components/emptyState";
import usePageEditorPage from "../../hook";
import Skeleton from "@components/skeleton";
import Button from "@components/button";
import Badge from "@components/badge";

import type { VersionComparison } from "@utils/types/sitePage";
import type { SegmentedOption } from "@components/segmentedControl/types";

const comparisonOptions: SegmentedOption<VersionComparison>[] = [
  { value: "previous", label: "Com a anterior" },
  { value: "draft", label: "Com o editor" }
];

const VersionsTab = () => {
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
  const previousNumber = selectedVersion !== null && selectedVersion > 1 ? selectedVersion - 1 : null;

  useEffect(() => {
    if (!hasLoadedVersions) loadVersions();
  }, [hasLoadedVersions, loadVersions]);

  useEffect(() => {
    if (selectedVersion === null) return;
    loadVersionHtml(selectedVersion);
    if (previousNumber !== null) loadVersionHtml(previousNumber);
  }, [selectedVersion, previousNumber, loadVersionHtml]);

  if (!sitePage) return null;

  if (!hasLoadedVersions && isVersionsLoading) {
    return (
      <Container aria-busy="true">
        <Skeleton height="320px" radius="panel" />
        <Skeleton height="420px" radius="panel" />
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

  const getComparisonTitle = () => {
    if (!selected) return "Escolha uma versão";
    if (isComparingDraft) return `${selected.label} → editor${isDirty ? " (não salvo)" : ""}`;
    return previousNumber !== null ? `${versionLabel(previousNumber)} → ${selected.label}` : `${selected.label}, a primeira versão`;
  };

  return (
    <Container>
      <ListPanel>
        <List aria-label="Versões da página">
          {versions.map((version) => (
            <li key={version.id}>
              <Item
                type="button"
                $isSelected={version.number === selectedVersion}
                aria-pressed={version.number === selectedVersion}
                onClick={() => handleVersionSelect(version.number)}
              >
                <ItemTitle>
                  <Badge isMono tone={version.number === sitePage.version ? "success" : "neutral"}>
                    {version.label}
                  </Badge>
                  {version.number === sitePage.version && <span>No ar</span>}
                </ItemTitle>
                <ItemMeta>
                  {version.actor.name} · {formatRelativeTime(version.createdAt, now)} · {formatBytes(version.size)}
                </ItemMeta>
                {version.restoredFrom !== null && <ItemMeta>Restaurada da {versionLabel(version.restoredFrom)}</ItemMeta>}
              </Item>
            </li>
          ))}
        </List>
      </ListPanel>
      <Comparison>
        <ComparisonHeader>
          <ComparisonTitle>{getComparisonTitle()}</ComparisonTitle>
          <SegmentedControl label="Comparar" options={comparisonOptions} value={comparison} onValueChange={setComparison} />
        </ComparisonHeader>
        {original === undefined || modified === undefined ? (
          <Skeleton height="420px" radius="panel" />
        ) : (
          <DiffViewer original={original} modified={modified} label={`Diferenças: ${getComparisonTitle()}`} />
        )}
        <Note>
          Em verde o que entrou, em vermelho o que saiu. Restaurar leva o código desta versão para o editor; ao salvar, ele vira uma versão nova.
        </Note>
        {selected && (
          <Button
            variant="secondary"
            leftIcon={<CounterClockwiseClockIcon />}
            disabled={isCurrent && !isDirty}
            onClick={() => handleVersionRestore(selected.number)}
          >
            Restaurar a {selected.label} no editor
          </Button>
        )}
      </Comparison>
    </Container>
  );
};

export default VersionsTab;
