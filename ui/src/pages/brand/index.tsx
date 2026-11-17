import { Theme } from "@radix-ui/themes";
import { useEffect } from "react";

import BrandHeader from "./subcomponents/brandHeader";
import TypographySection from "./sections/typography";
import DownloadsSection from "./sections/downloads";
import { Content, Footer, Page } from "./styles";
import ConceptSection from "./sections/concept";
import ColorsSection from "./sections/colors";
import MotionSection from "./sections/motion";
import SymbolSection from "./sections/symbol";
import ToolsSection from "./sections/tools";
import UsageSection from "./sections/usage";
import IconSection from "./sections/icon";
import LogoSection from "./sections/logo";
import Hero from "./sections/hero";
import useBrandPage from "./hook";



const BrandPage = () => {
  const { prepareAssets } = useBrandPage();

  useEffect(() => {
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
