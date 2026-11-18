import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { loader } from "@monaco-editor/react";

import type { DefaultTheme } from "styled-components";
import type { Monaco } from "@monaco-editor/react";

export const editorThemeName = "pocketrun";

self.MonacoEnvironment = {
  getWorker: (_workerId: string, label: string) => (label === "html" ? new HtmlWorker() : new EditorWorker())
};

loader.config({ monaco });

export const defineEditorTheme = (instance: Monaco, brand: DefaultTheme["brand"]) => {
  instance.editor.defineTheme(editorThemeName, {
    base: "vs-dark",
    inherit: true,
    rules: [],
    colors: {
      "editor.background": brand.graphite,
      "editor.lineHighlightBackground": brand.surface,
      "editorLineNumber.foreground": brand.inkMuted,
      "editorLineNumber.activeForeground": brand.steelMuted,
      "editorGutter.background": brand.graphite,
      "diffEditor.insertedTextBackground": brand.states.successSoft,
      "diffEditor.removedTextBackground": brand.states.errorSoft
    }
  });
};
