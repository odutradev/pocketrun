import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/editor/contrib/hover/browser/hoverContribution";
import "monaco-editor/esm/vs/editor/contrib/format/browser/formatActions";
import "monaco-editor/esm/vs/editor/contrib/gotoError/browser/gotoError";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import "monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.css";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import { loader } from "@monaco-editor/react";

import type { DefaultTheme } from "styled-components";
import type { Monaco } from "@monaco-editor/react";

export const editorThemeName = "pocketrun";

export const issuesOwner = "pocketrun-html";

self.MonacoEnvironment = {
  getWorker: (_workerId: string, label: string) => {
    if (label === "html") return new HtmlWorker();
    if (label === "json") return new JsonWorker();
    return new EditorWorker();
  }
};

loader.config({ monaco });

const withAlpha = (hex: string, alpha: number) =>
  `${hex}${Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0")}`;

export const defineEditorTheme = (instance: Monaco, brand: DefaultTheme["brand"]) => {
  const { success, error } = brand.states;
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
      "diffEditor.insertedLineBackground": withAlpha(success, 0.1),
      "diffEditor.insertedTextBackground": withAlpha(success, 0.28),
      "diffEditor.removedLineBackground": withAlpha(error, 0.1),
      "diffEditor.removedTextBackground": withAlpha(error, 0.28),
      "diffEditorGutter.insertedLineBackground": withAlpha(success, 0.18),
      "diffEditorGutter.removedLineBackground": withAlpha(error, 0.18),
      "diffEditorOverview.insertedForeground": withAlpha(success, 0.6),
      "diffEditorOverview.removedForeground": withAlpha(error, 0.6),
      "diffEditor.diagonalFill": withAlpha(brand.border, 0.5),
      "diffEditor.border": brand.border
    }
  });
};
