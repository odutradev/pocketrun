import { PlusIcon, StackIcon } from "@radix-ui/react-icons";
import { Grid, Heading } from "@radix-ui/themes";

import Button from "@components/button";
import Card from "@components/card";

import useHomePage from "../../hook";
import ApplicationCard from "../applicationCard";
import { EmptyContent, EmptyDescription } from "./styles";

const ApplicationList: React.FC = () => {
  const { applications, handleOpenCreate } = useHomePage();

  return (
    <section>
      <Heading size="4" weight="bold" mb="3">
        Suas Aplicações ({applications.length})
      </Heading>

      {applications.length === 0 ? (
        <Card size="3" tone="dashed">
          <EmptyContent>
            <StackIcon />
            <Heading size="4" weight="bold" mb="1">
              Nenhuma aplicação criada ainda
            </Heading>
            <EmptyDescription size="2" color="gray" mb="4">
              Crie sua primeira aplicação para receber um Project ID e Token de Acesso exclusivo com isolamento no banco
              de dados.
            </EmptyDescription>
            <Button variant="solid" color="mint" size="2" onClick={handleOpenCreate} leftIcon={<PlusIcon />}>
              Criar Primeira Aplicação
            </Button>
          </EmptyContent>
        </Card>
      ) : (
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </Grid>
      )}
    </section>
  );
};

export default ApplicationList;
