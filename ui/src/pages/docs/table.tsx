import { kvDocMethodTones } from "@assets/data";
import { MutedText, RoutePath } from "./styles";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { KvDocError, KvDocRoute, PageConfigDocField } from "@utils/types/kvDocs";

export const routeColumns: DataTableColumn<KvDocRoute>[] = [
  {
    key: "method",
    header: "Método",
    render: (route) => (
      <Badge tone={kvDocMethodTones[route.method]} isMono>
        {route.method}
      </Badge>
    )
  },
  { key: "path", header: "Rota", render: (route) => <RoutePath>{route.path}</RoutePath> },
  { key: "description", header: "O que faz", render: (route) => <MutedText>{route.description}</MutedText> },
  { key: "response", header: "Sucesso", align: "right", render: (route) => <MutedText>{route.response}</MutedText> }
];

export const pageConfigFieldColumns: DataTableColumn<PageConfigDocField>[] = [
  { key: "path", header: "Campo", render: (field) => <RoutePath>{field.path}</RoutePath> },
  { key: "type", header: "Valor", render: (field) => <MutedText>{field.type}</MutedText> },
  { key: "description", header: "O que faz", render: (field) => <MutedText>{field.description}</MutedText> }
];

export const errorColumns: DataTableColumn<KvDocError>[] = [
  {
    key: "status",
    header: "Status",
    render: (error) => (
      <Badge tone={error.status >= 500 ? "error" : "warning"} isMono>
        {error.status}
      </Badge>
    )
  },
  { key: "code", header: "Código", render: (error) => <RoutePath>{error.code}</RoutePath> },
  { key: "description", header: "Quando acontece", render: (error) => <MutedText>{error.description}</MutedText> }
];
