import { ArrowDownIcon, DownloadIcon } from "@radix-ui/react-icons";
import { SegmentedControl } from "@radix-ui/themes";

import { Actions, Container, Intro, Showcase, ShowcaseStage, Title } from "./styles";
import { ControlScroller, Eyebrow, Lead, PanelText } from "../../styles";
import { brandContextOptions, defaultLogoConfig } from "@assets/data";
import LinkButton from "@components/linkButton";
import BrandMark from "@components/brandMark";
import Button from "@components/button";
import useBrandPage from "../../hook";

const Hero = () => {
  const { heroContext, handleHeroContextChange, handleDownloadSvg } = useBrandPage();
  const activeContext = brandContextOptions.find((option) => option.value === heroContext);

  const handleContextChange = (raw: string) => {
    const option = brandContextOptions.find((item) => item.value === raw);
    if (option) handleHeroContextChange(option.value);
  };

  return (
    <Container>
      <Intro>
        <Eyebrow>Manual de marca · Identidade visual oficial</Eyebrow>
        <Title>Identidade visual do PocketRun</Title>
        <Lead>
          O guia de símbolo, logotipo, cores, tipografia e usos da marca, com todos os arquivos para baixar em SVG, PNG,
          WEBP e JPG, em vários tamanhos, proporções e cores.
        </Lead>
        <Actions>
          <LinkButton href="#downloads" variant="primary" size="lg" rightIcon={<ArrowDownIcon />}>
            Ir para os downloads
          </LinkButton>
          <Button
            size="lg"
            variant="secondary"
            leftIcon={<DownloadIcon />}
            onClick={() => handleDownloadSvg(defaultLogoConfig)}
          >
            Baixar o logo principal (SVG)
          </Button>
        </Actions>
      </Intro>
      <Showcase>
        <ShowcaseStage $context={heroContext}>
          <BrandMark kind="stacked" size={34} context={heroContext} motion="intro" />
        </ShowcaseStage>
        <ControlScroller>
          <SegmentedControl.Root value={heroContext} onValueChange={handleContextChange} size="2">
            {brandContextOptions.map((option) => (
              <SegmentedControl.Item key={option.value} value={option.value}>
                {option.label}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </ControlScroller>
        <PanelText>{activeContext?.description}</PanelText>
      </Showcase>
    </Container>
  );
};

export default Hero;
