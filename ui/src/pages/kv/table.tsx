import { CheckIcon, CopyIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { AppCell, Description, Meta, MutedText, ProjectId, RowActions, Title, Tokens } from "./styles";
import { allowsAnyOrigin, countTokens, describeLastUse, describeOrigins } from "@utils/functions";
import IconButton from "@components/iconButton";
import Badge from "@components/badge";

import type { DataTableColumn } from "@components/dataTable/types";
import type { Application } from "@utils/types/application";
import type { AppColumnsOptions } from "./types";

export const getAppColumns = ({ isCopied, onCopy, onEdit, onRemove }: AppColumnsOptions): DataTableColumn<Application>[] => [
  {
    key: "application",
    header: "Aplicação",
    render: (application) => (
      <AppCell>
        <Title>{application.name}</Title>
        <Meta>
          <ProjectId>{application.projectId}</ProjectId>
          {application.description && <Description title={application.description}>{application.description}</Description>}
        </Meta>
      </AppCell>
    )
  },
  {
    key: "origins",
    header: "Origens",
    render: (application) => {
      const isOpen = allowsAnyOrigin(application.allowedOrigins);
      return (
        <Badge tone={isOpen ? "warning" : "neutral"} hasDot={isOpen}>
          {describeOrigins(application.allowedOrigins)}
        </Badge>
      );
    }
  },
  {
    key: "lastUse",
    header: "Último uso",
    render: (application) => <MutedText>{describeLastUse(application)}</MutedText>
  },
  {
    key: "tokens",
    header: "Tokens",
    align: "right",
    render: (application) => <Tokens>{countTokens(application)}</Tokens>
  },
  {
    key: "actions",
    header: "Ações",
    isHeaderHidden: true,
    align: "right",
    render: (application) => (
      <RowActions>
        <IconButton
          label={isCopied(application.id) ? "Project ID copiado" : `Copiar o Project ID de ${application.name}`}
          icon={isCopied(application.id) ? <CheckIcon /> : <CopyIcon />}
          size="sm"
          onClick={() => onCopy(application)}
        />
        <IconButton label={`Abrir ${application.name}`} icon={<Pencil1Icon />} size="sm" onClick={() => onEdit(application)} />
        <IconButton
          label={`Excluir ${application.name}`}
          icon={<TrashIcon />}
          size="sm"
          variant="danger"
          onClick={() => onRemove(application)}
        />
      </RowActions>
    )
  }
];
