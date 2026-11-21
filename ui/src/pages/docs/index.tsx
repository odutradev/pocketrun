import { Container, Content, Layout, Toc, TocGroup, TocLink, TocTitle } from "./styles";
import ActivationSection from "./sections/activation";
import ContentNavbar from "@components/contentNavbar";
import PageIntroSection from "./sections/pageIntro";
import DocumentsSection from "./sections/documents";
import AggregateSection from "./sections/aggregate";
import AnalyticsSection from "./sections/analytics";
import PageDataSection from "./sections/pageData";
import TransferSection from "./sections/transfer";
import SecuritySection from "./sections/security";
import OverviewSection from "./sections/overview";
import KvIntroSection from "./sections/kvIntro";
import ExampleSection from "./sections/example";
import RoutesSection from "./sections/routes";
import CreateSection from "./sections/create";
import ExpirySection from "./sections/expiry";
import ErrorsSection from "./sections/errors";
import EditorSection from "./sections/editor";
import AccessSection from "./sections/access";
import BackupSection from "./sections/backup";
import RolesSection from "./sections/roles";
import PanelSection from "./sections/panel";
import LinksSection from "./sections/links";
import UsersSection from "./sections/users";
import AuthSection from "./sections/auth";
import ListSection from "./sections/list";
import LlmsSection from "./sections/llms";
import useDocsPage from "./hook";

import type { MouseEvent } from "react";

const DocsPage = () => {
  const { groups, handleJump } = useDocsPage();

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    handleJump(sectionId);
  };

  return (
    <Container>
      <ContentNavbar
        title="Documentação"
        info="Como usar todo o PocketRun: o painel, a API pública do KV, páginas com PIN e dados, links curtos, ativação, análise, usuários, backup e o llms.txt para assistentes de IA."
      />
      <Layout>
        <Toc aria-label="Seções da documentação">
          {groups.map((group) => (
            <TocGroup key={group.id}>
              <TocTitle>{group.label}</TocTitle>
              {group.sections.map((section) => (
                <TocLink key={section.id} href={`#${section.id}`} onClick={(event) => handleTocClick(event, section.id)}>
                  {section.label}
                </TocLink>
              ))}
            </TocGroup>
          ))}
        </Toc>
        <Content>
          <OverviewSection />
          <PanelSection />
          <KvIntroSection />
          <AuthSection />
          <RoutesSection />
          <CreateSection />
          <ListSection />
          <DocumentsSection />
          <AggregateSection />
          <TransferSection />
          <ExpirySection />
          <RolesSection />
          <ErrorsSection />
          <SecuritySection />
          <PageIntroSection />
          <EditorSection />
          <AccessSection />
          <PageDataSection />
          <ExampleSection />
          <LinksSection />
          <ActivationSection />
          <AnalyticsSection />
          <UsersSection />
          <BackupSection />
          <LlmsSection />
        </Content>
      </Layout>
    </Container>
  );
};

export default DocsPage;
