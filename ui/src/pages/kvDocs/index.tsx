import { Container, Content, Layout, Toc, TocLink, TocTitle } from "./styles";
import ContentNavbar from "@components/contentNavbar";
import DocumentsSection from "./sections/documents";
import AggregateSection from "./sections/aggregate";
import TransferSection from "./sections/transfer";
import SecuritySection from "./sections/security";
import OverviewSection from "./sections/overview";
import ExampleSection from "./sections/example";
import RoutesSection from "./sections/routes";
import CreateSection from "./sections/create";
import ExpirySection from "./sections/expiry";
import ErrorsSection from "./sections/errors";
import RolesSection from "./sections/roles";
import PagesSection from "./sections/pages";
import AuthSection from "./sections/auth";
import ListSection from "./sections/list";
import useKvDocsPage from "./hook";

import type { ContentNavbarCrumb } from "@components/contentNavbar/types";
import type { MouseEvent } from "react";

const parents: ContentNavbarCrumb[] = [{ label: "KV", to: "/kv" }];

const KvDocsPage = () => {
  const { sections, handleJump } = useKvDocsPage();

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    handleJump(sectionId);
  };

  return (
    <Container>
      <ContentNavbar
        title="Documentação"
        parents={parents}
        info="Como usar a API pública do KV: autenticação, rotas, filtros, cálculos, importação, validade, cargos, páginas com pocketrun.kv, erros e os cuidados com o token."
      />
      <Layout>
        <Toc aria-label="Seções da documentação">
          <TocTitle>Nesta página</TocTitle>
          {sections.map((section) => (
            <TocLink key={section.id} href={`#${section.id}`} onClick={(event) => handleTocClick(event, section.id)}>
              {section.label}
            </TocLink>
          ))}
        </Toc>
        <Content>
          <OverviewSection />
          <AuthSection />
          <RoutesSection />
          <CreateSection />
          <ListSection />
          <DocumentsSection />
          <AggregateSection />
          <TransferSection />
          <ExpirySection />
          <RolesSection />
          <PagesSection />
          <ErrorsSection />
          <SecuritySection />
          <ExampleSection />
        </Content>
      </Layout>
    </Container>
  );
};

export default KvDocsPage;
