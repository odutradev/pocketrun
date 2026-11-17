import { MagnifyingGlassIcon, PlusIcon } from "@radix-ui/react-icons";

import Button from "@components/button";
import Card from "@components/card";
import EmptyState from "@components/emptyState";
import Input from "@components/input";
import { pluralize } from "@utils/functions";

import useHomePage from "../../hook";
import ApplicationCard from "../applicationCard";
import { CardGrid, Count, CreateTile, SearchBox, Section, Toolbar } from "./styles";

const ApplicationList: React.FC = () => {
  const { applications, filteredApplications, search, handleSearchChange, handleOpenCreate } = useHomePage();

  if (applications.length === 0) {
    return (
      <Card tone="dashed">
        <EmptyState
          title="Nenhuma aplicação ainda"
          description="Crie a primeira para receber um Project ID e um token de acesso, com os dados isolados das outras."
          actions={
            <Button leftIcon={<PlusIcon />} onClick={handleOpenCreate}>
              Criar a primeira aplicação
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Section aria-label="Suas aplicações">
      <Toolbar>
        <SearchBox>
          <Input
            type="search"
            label="Buscar aplicação"
            isLabelHidden
            leftIcon={<MagnifyingGlassIcon />}
            placeholder="Buscar por nome ou Project ID"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </SearchBox>
        <Count aria-live="polite">
          {search
            ? `${filteredApplications.length} de ${pluralize(applications.length, "aplicação", "aplicações")}`
            : pluralize(applications.length, "aplicação", "aplicações")}
        </Count>
      </Toolbar>

      {filteredApplications.length === 0 ? (
        <EmptyState
          isCompact
          title="Nada encontrado"
          description="Nenhuma aplicação tem esse nome ou Project ID."
          actions={
            <Button variant="secondary" onClick={() => handleSearchChange("")}>
              Limpar busca
            </Button>
          }
        />
      ) : (
        <CardGrid>
          {filteredApplications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
          {!search && (
            <CreateTile type="button" onClick={handleOpenCreate}>
              <PlusIcon aria-hidden="true" />
              Nova aplicação
            </CreateTile>
          )}
        </CardGrid>
      )}
    </Section>
  );
};

export default ApplicationList;
