import { useEffect, useRef } from "react";
import { useTheme } from "styled-components";
import Editor from "@monaco-editor/react";

import { defineEditorTheme, editorThemeName } from "@utils/monaco";
import Loader from "@components/loader";
import { Container } from "./styles";

import type { Monaco } from "@monaco-editor/react";
import type { JsonEditorProps } from "./types";

const JsonEditor = ({ value, label, fileName, schema, onChange, onSave }: JsonEditorProps) => {
  const { brand } = useTheme();
  const saveRef = useRef(onSave);

  useEffect(() => {
    saveRef.current = onSave;
  }, [onSave]);

  const prepare = (instance: Monaco) => {
    defineEditorTheme(instance, brand);
    const current = instance.languages.json.jsonDefaults.diagnosticsOptions.schemas ?? [];
    const uri = `https://pocketrun.local/schemas/${fileName}`;
    instance.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [...current.filter((entry) => entry.uri !== uri), { uri, fileMatch: [fileName], schema }]
    });
  };

  return (
    <Container>
      <Editor
        value={value}
        path={fileName}
        language="json"
        theme={editorThemeName}
        loading={<Loader label="Carregando o editor" isCentered />}
        beforeMount={prepare}
        onMount={(mounted, instance) => mounted.addCommand(instance.KeyMod.CtrlCmd | instance.KeyCode.KeyS, () => saveRef.current())}
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

export default JsonEditor;
