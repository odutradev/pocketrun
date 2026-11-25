import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "styled-components";
import { useEffect, useRef } from "react";

import { defineEditorTheme, editorThemeName } from "@utils/monaco";
import Loader from "@components/loader";
import { Container } from "./styles";

import type { DiffViewerProps } from "./types";

const countLines = (start: number, end: number) => (end >= start && end > 0 ? end - start + 1 : 0);

const DiffViewer = ({ original, modified, label, isSideBySide, onStatsChange }: DiffViewerProps) => {
  const { brand } = useTheme();
  const statsRef = useRef(onStatsChange);

  useEffect(() => {
    statsRef.current = onStatsChange;
  }, [onStatsChange]);

  return (
    <Container role="region" aria-label={label}>
      <DiffEditor
        original={original}
        modified={modified}
        language="html"
        theme={editorThemeName}
        loading={<Loader label="Carregando a comparação" isCentered />}
        beforeMount={(instance) => defineEditorTheme(instance, brand)}
        onMount={(editor) => {
          editor.onDidUpdateDiff(() => {
            const changes = editor.getLineChanges() ?? [];
            statsRef.current({
              added: changes.reduce((total, change) => total + countLines(change.modifiedStartLineNumber, change.modifiedEndLineNumber), 0),
              removed: changes.reduce((total, change) => total + countLines(change.originalStartLineNumber, change.originalEndLineNumber), 0)
            });
          });
        }}
        options={{
          automaticLayout: true,
          fontFamily: brand.fonts.mono,
          fontSize: 13,
          glyphMargin: false,
          minimap: { enabled: false },
          originalEditable: false,
          readOnly: true,
          renderIndicators: false,
          renderMarginRevertIcon: false,
          renderOverviewRuler: false,
          renderSideBySide: isSideBySide,
          useInlineViewWhenSpaceIsLimited: false,
          hideUnchangedRegions: { enabled: true, contextLineCount: 3, minimumLineCount: 6, revealLineCount: 20 },
          scrollBeyondLastLine: false,
          wordWrap: "on"
        }}
      />
    </Container>
  );
};

export default DiffViewer;
