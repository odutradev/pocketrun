import { CounterClockwiseClockIcon, EnterFullScreenIcon, ExitFullScreenIcon, RowsIcon, ViewVerticalIcon } from "@radix-ui/react-icons";
import { useTheme } from "styled-components";
import { useEffect, useState } from "react";

import {
  Added,
  Bar,
  BarGroup,
  Body,
  BaseField,
  Container,
  Item,
  ItemHeader,
  ItemLabel,
  ItemMessage,
  ItemMeta,
  ItemTime,
  List,
  ListCount,
  ListPanel,
  ListTitle,
  LiveDot,
  Removed,
  Stats,
  Title,
  Tools,
  Workbench
} from "./styles";
import { currentTimestamp, formatBytes, formatRelativeTime, versionLabel } from "@utils/functions";
import { pageVersionsKept } from "@assets/config";
import DiffViewer from "../../subcomponents/diffViewer";
import useMediaQuery from "@hooks/useMediaQuery";
import IconButton from "@components/iconButton";
import EmptyState from "@components/emptyState";
import usePageEditorPage from "../../hook";
import Skeleton from "@components/skeleton";
import Button from "@components/button";
import Select from "@components/select";
import Badge from "@components/badge";

import type { DiffStats } from "../../subcomponents/diffViewer/types";
import type { PageVersion, VersionBase } from "@utils/types/sitePage";

const describeVersion = (version: PageVersion) => (version.message ? `${version.label} · ${version.message}` : version.label);

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
  const [base, setBase] = useState<VersionBase>("previous");
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<DiffStats | null>(null);
  const previousNumber = versions.find((version) => selectedVersion !== null && version.number < selectedVersion)?.number ?? null;
  const baseNumber = base === "previous" ? previousNumber : base === "draft" ? null : Number(base);

  useEffect(() => {
    if (!hasLoadedVersions) loadVersions();
  }, [hasLoadedVersions, loadVersions]);

  useEffect(() => {
    if (selectedVersion === null) return;
    loadVersionHtml(selectedVersion);
    if (baseNumber !== null) loadVersionHtml(baseNumber);
  }, [selectedVersion, baseNumber, loadVersionHtml]);

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
  const isComparingDraft = base === "draft";
  const olderNumber = baseNumber !== null && selectedVersion !== null ? Math.min(baseNumber, selectedVersion) : null;
  const newerNumber = baseNumber !== null && selectedVersion !== null ? Math.max(baseNumber, selectedVersion) : null;
  const getSides = (): [string | undefined, string | undefined] => {
    if (isComparingDraft) return [selectedHtml, draft.html];
    if (olderNumber === null || newerNumber === null) return ["", selectedHtml];
    return [versionHtml[olderNumber], versionHtml[newerNumber]];
  };
  const [original, modified] = getSides();
  const baseOptions = [
    { value: "previous", label: previousNumber !== null ? `Anterior (${versionLabel(previousNumber)})` : "Anterior" },
    { value: "draft", label: "Código do editor" },
    ...versions.filter((version) => version.number !== selectedVersion).map((version) => ({ value: `${version.number}`, label: describeVersion(version) }))
  ];
  const isCurrent = selected?.number === sitePage.version;
  const isSplit = isSideBySide && (isWide || isExpanded);

  const getTitle = () => {
    if (!selected) return "Escolha uma versão";
    if (isComparingDraft) return `${selected.label} → editor`;
    if (olderNumber !== null && newerNumber !== null) return `${versionLabel(olderNumber)} → ${versionLabel(newerNumber)}`;
    return selected.number === 1 ? `${selected.label} · primeira versão` : `${selected.label} · mais antiga guardada`;
  };

  const handleSelect = (number: number) => {
    setStats(null);
    if (base === `${number}`) setBase("previous");
    handleVersionSelect(number);
  };

  const handleBaseChange = (next: string) => {
    setStats(null);
    setBase(next as VersionBase);
  };

  return (
    <Container>
      <ListPanel>
        <ListTitle>
          Versões
          <ListCount title={`Ficam guardadas as últimas ${pageVersionsKept} versões`}>
            {versions.length}/{pageVersionsKept}
          </ListCount>
        </ListTitle>
        <List aria-label="Versões da página">
          {versions.map((version) => {
            const isSelected = version.number === selectedVersion;
            const isLive = version.number === sitePage.version;
            return (
              <li key={version.id}>
                <Item type="button" $isSelected={isSelected} aria-pressed={isSelected} onClick={() => handleSelect(version.number)}>
                  <ItemHeader>
                    <ItemLabel>
                      {version.label}
                      {isLive && <LiveDot role="img" aria-label="No ar" title="No ar" />}
                    </ItemLabel>
                    <ItemTime dateTime={version.createdAt}>{formatRelativeTime(version.createdAt, now)}</ItemTime>
                  </ItemHeader>
                  {version.message && <ItemMessage>{version.message}</ItemMessage>}
                  <ItemMeta>
                    {version.actor.name} · {formatBytes(version.size)}
                    {version.restoredFrom !== null && ` · restaurada da ${versionLabel(version.restoredFrom)}`}
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
            <Title title={getTitle()}>{getTitle()}</Title>
            {isComparingDraft && isDirty && <Badge tone="warning">Editor não salvo</Badge>}
            {stats && (
              <Stats aria-label={`${stats.added} linhas entraram e ${stats.removed} saíram`}>
                <Added>+{stats.added}</Added>
                <Removed>−{stats.removed}</Removed>
              </Stats>
            )}
          </BarGroup>
          <Tools>
            <BaseField>
              <Select label="Comparar com" isLabelHidden size="sm" options={baseOptions} value={base} onValueChange={handleBaseChange} />
            </BaseField>
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
            {selected && (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<CounterClockwiseClockIcon />}
                title="Leva o código para o editor; ao salvar, ele vira uma versão nova"
                disabled={isCurrent && !isDirty}
                onClick={() => handleVersionRestore(selected.number)}
              >
                Restaurar
              </Button>
            )}
          </Tools>
        </Bar>
        <Body>
          {original === undefined || modified === undefined ? (
            <Skeleton height="100%" />
          ) : (
            <DiffViewer
              key={`${selectedVersion}-${base}`}
              original={original}
              modified={modified}
              label={`Diferenças: ${getTitle()}`}
              isSideBySide={isSplit}
              onStatsChange={setStats}
            />
          )}
        </Body>
      </Workbench>
    </Container>
  );
};

export default VersionsTab;
