import { ArrowRightIcon } from "@radix-ui/react-icons";

import { formatDate, pluralize } from "@utils/functions";
import LinkButton from "@components/linkButton";
import { Name, ProjectId } from "./styles";

import type { DataTableColumn } from "@components/dataTable/types";
import type { Application } from "@utils/types/application";

export const applicationColumns: DataTableColumn<Application>[] = [
  { key: "name", header: "Aplicação", render: (application) => <Name>{application.name}</Name> },
  { key: "projectId", header: "Project ID", render: (application) => <ProjectId>{application.projectId}</ProjectId> },
  {
    key: "tokens",
    header: "Tokens",
    render: (application) => pluralize(application.tokens?.length ?? 0, "token", "tokens")
  },
  { key: "createdAt", header: "Criada em", render: (application) => formatDate(application.createdAt) },
  {
    key: "open",
    header: "Abrir",
    isHeaderHidden: true,
    align: "right",
    render: (application) => (
      <LinkButton to={`/apps/${application.id}`} size="sm" variant="secondary" rightIcon={<ArrowRightIcon />}>
        Abrir explorador
      </LinkButton>
    )
  }
];
