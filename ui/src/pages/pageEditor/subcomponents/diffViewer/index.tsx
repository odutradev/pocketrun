import { DiffEditor } from "@monaco-editor/react";
import { useTheme } from "styled-components";

import { defineEditorTheme, editorThemeName } from "../codeEditor/setup";
import useMediaQuery from "@hooks/useMediaQuery";
import Loader from "@components/loader";
import { Container } from "./styles";

import type { DiffViewerProps } from "./types";

const DiffViewer = ({ original, modified, label }: DiffViewerProps) => {
  const { brand, breakpoints } = useTheme();
  const isWide = useMediaQuery(`(min-width: ${breakpoints.lg})`);

  return (
    <Container role="region" aria-label={label}>
      <DiffEditor
        original={original}
        modified={modified}
        language="html"
        theme={editorThemeName}
        loading={<Loader label="Carregando a comparação" isCentered />}
        beforeMount={(instance) => defineEditorTheme(instance, brand)}
        options={{
          automaticLayout: true,
          fontFamily: brand.fonts.mono,
          fontSize: 13,
          minimap: { enabled: false },
          originalEditable: false,
          readOnly: true,
          renderSideBySide: isWide,
          scrollBeyondLastLine: false,
          wordWrap: "on"
        }}
      />
    </Container>
  );
};

export default DiffViewer;
