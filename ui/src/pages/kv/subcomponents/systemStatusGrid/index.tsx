import StatCard from "@components/statCard";
import useKvPage from "../../hook";
import { StatGrid } from "./styles";

const SystemStatusGrid = () => {
  const { applications, totalTokens, openOriginCount } = useKvPage();

  return (
    <StatGrid>
      <StatCard label="Aplicações" value={applications.length} hint="Projetos isolados nesta instância" />
      <StatCard label="Tokens de acesso" value={totalTokens} hint="Somando todas as aplicações" />
      <StatCard
        label="Abertas a qualquer origem"
        value={openOriginCount}
        hint={openOriginCount > 0 ? "Revise em Segurança antes de publicar" : "Todas com origens definidas"}
      />
    </StatGrid>
  );
};

export default SystemStatusGrid;
