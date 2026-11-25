import { useEffect, useImperativeHandle, useRef } from "react";
import { useTheme } from "styled-components";
import Editor from "@monaco-editor/react";

import { defineEditorTheme, editorThemeName, issuesOwner } from "@utils/monaco";
import { findHtmlIssues } from "@utils/functions";
import { pageLintDelay } from "@assets/config";
import Loader from "@components/loader";
import { Container } from "./styles";

import type { CodeEditorProps } from "./types";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

const CodeEditor = ({ ref, value, label, onChange, onSave, onIssuesChange }: CodeEditorProps) => {
  const { brand } = useTheme();
  const saveRef = useRef(onSave);
  const issuesRef = useRef(onIssuesChange);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  useEffect(() => {
    saveRef.current = onSave;
    issuesRef.current = onIssuesChange;
  }, [onSave, onIssuesChange]);

  useImperativeHandle(ref, () => ({
    format: () => {
      editorRef.current?.focus();
      editorRef.current?.getAction("editor.action.formatDocument")?.run();
    },
    goToNextIssue: () => {
      editorRef.current?.focus();
      editorRef.current?.getAction("editor.action.marker.next")?.run();
    }
  }));

  const checkIssues = () => {
    const model = editorRef.current?.getModel();
    const instance = monacoRef.current;
    if (!model || !instance) return;
    const markers = findHtmlIssues(model.getValue()).map((issue) => {
      const start = model.getPositionAt(issue.start);
      const end = model.getPositionAt(issue.end);
      return {
        severity: instance.MarkerSeverity.Warning,
        message: issue.message,
        startLineNumber: start.lineNumber,
        startColumn: start.column,
        endLineNumber: end.lineNumber,
        endColumn: end.column
      };
    });
    instance.editor.setModelMarkers(model, issuesOwner, markers);
    issuesRef.current?.(markers.length);
  };

  useEffect(() => {
    const timeout = window.setTimeout(checkIssues, pageLintDelay);
    return () => window.clearTimeout(timeout);
  }, [value]);

  return (
    <Container>
      <Editor
        value={value}
        language="html"
        theme={editorThemeName}
        loading={<Loader label="Carregando o editor" isCentered />}
        beforeMount={(instance) => defineEditorTheme(instance, brand)}
        onMount={(mounted, instance) => {
          editorRef.current = mounted;
          monacoRef.current = instance;
          mounted.addCommand(instance.KeyMod.CtrlCmd | instance.KeyCode.KeyS, () => saveRef.current());
          checkIssues();
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
