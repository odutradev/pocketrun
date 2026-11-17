import { Theme } from "@radix-ui/themes";
import { useEffect } from "react";

import useBrandPage from "./hook";
import metadata from "./metadata";
import ColorsSection from "./sections/colors";
import ConceptSection from "./sections/concept";
import DownloadsSection from "./sections/downloads";
import Hero from "./sections/hero";
import IconSection from "./sections/icon";
import LogoSection from "./sections/logo";
import MotionSection from "./sections/motion";
import SymbolSection from "./sections/symbol";
import ToolsSection from "./sections/tools";
import TypographySection from "./sections/typography";
import UsageSection from "./sections/usage";
import { Content, Footer, Page } from "./styles";
import BrandHeader from "./subcomponents/brandHeader";

const BrandPage: React.FC = () => {
  const { prepareAssets } = useBrandPage();

  useEffect(() => {
    document.title = `${metadata.title} | PocketRun`;
    prepareAssets();
  }, [prepareAssets]);

  return (
    <Theme appearance="dark" accentColor="gray" grayColor="gray" radius="large" hasBackground={false}>
      <Page>
        <BrandHeader />
        <Content>
          <Hero />
          <ConceptSection />
          <SymbolSection />
          <LogoSection />
          <ColorsSection />
          <TypographySection />
          <IconSection />
          <ToolsSection />
          <UsageSection />
          <MotionSection />
          <DownloadsSection />
          <Footer>
            <span>Identidade visual · PocketRun</span>
            <span>Versão de novembro de 2026</span>
          </Footer>
        </Content>
      </Page>
    </Theme>
  );
};

export default BrandPage;
