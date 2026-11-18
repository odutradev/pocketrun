import { useTheme } from "styled-components";
import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";

import { defineEditorTheme, editorThemeName } from "./setup";
import Loader from "@components/loader";
import { Container } from "./styles";

import type { CodeEditorProps } from "./types";

const CodeEditor = ({ value, label, onChange, onSave }: CodeEditorProps) => {
  const { brand } = useTheme();
  const saveRef = useRef(onSave);

  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  return (
    <Container>
      <Editor
        value={value}
        language="html"
        theme={editorThemeName}
        loading={<Loader label="Carregando o editor" isCentered />}
        beforeMount={(instance) => defineEditorTheme(instance, brand)}
        onMount={(editor, instance) => {
          editor.addCommand(instance.KeyMod.CtrlCmd | instance.KeyCode.KeyS, () => saveRef.current());
        }}
        onChange={(next) => onChange(next ?? "")}
        options={{
          ariaLabel: label,
          automaticLayout: true,
          fontFamily: brand.fonts.mono,
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          tabSize: 2,
          wordWrap: "on"
        }}
      />
    </Container>
  );
};

export default CodeEditor;
