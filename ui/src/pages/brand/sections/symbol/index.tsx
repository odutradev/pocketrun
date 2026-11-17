import { Switch } from "@radix-ui/themes";

import { brandOpticalSizes, brandSymbolParts } from "@assets/data";
import BrandSymbol from "@components/brandSymbol";
import { symbolBlades, symbolHandle, symbolPivot } from "@utils/functions/brandAssets";

import useBrandPage from "../../hook";
import SectionHeading from "../../subcomponents/sectionHeading";
import { Grid, Label, Lead, Panel, PanelText, PanelTitle, Section, Stage } from "../../styles";
import { Dot, Figure, Guides, GuidesToggle, Layout, PartHeader, PartSpec, Parts, Rule } from "./styles";

const gridLines = Array.from({ length: 13 }, (_, index) => index * 8);

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const SymbolSection: React.FC = () => {
  const { isGuidesVisible, handleGuidesChange } = useBrandPage();

  return (
    <Section id="simbolo">
      <SectionHeading
        number="02"
        title="O símbolo"
        lead="Um canivete num grid de 96 × 96: um cabo e três lâminas que saem do mesmo rebite. O cabo é a instância; cada lâmina, uma ferramenta."
      />
      <Layout>
        <Panel>
          <GuidesToggle>
            <Switch checked={isGuidesVisible} onCheckedChange={handleGuidesChange} highContrast />
            Mostrar guias e grid 96 × 96
          </GuidesToggle>
          <Figure>
            <BrandSymbol size={360} frame="full" title="Símbolo do PocketRun" />
            {isGuidesVisible && (
              <Guides viewBox="0 0 96 96" aria-hidden>
                {gridLines.map((position) => (
                  <g key={position}>
                    <line className="grid" x1={position} y1="0" x2={position} y2="96" />
                    <line className="grid" x1="0" y1={position} x2="96" y2={position} />
                  </g>
                ))}
                {symbolBlades.map(({ tool, angle, length }) => (
                  <line
                    key={tool}
                    className="axis"
                    x1={symbolPivot.x}
                    y1={symbolPivot.y}
                    x2={symbolPivot.x + Math.cos(toRadians(angle)) * (length + 8)}
                    y2={symbolPivot.y + Math.sin(toRadians(angle)) * (length + 8)}
                  />
                ))}
                <rect
                  className="axis"
                  x={symbolHandle.x}
                  y={symbolPivot.y - 10}
                  width={symbolHandle.width}
                  height="20"
                  fill="none"
                />
                <circle className="pivot" cx={symbolPivot.x} cy={symbolPivot.y} r="2" />
              </Guides>
            )}
          </Figure>
        </Panel>
        <Parts>
          {brandSymbolParts.map((part) => (
            <Panel key={part.number}>
              <PartHeader>
                <Dot $tool={part.tool} />
                <PanelTitle>
                  {part.number} · {part.name}
                </PanelTitle>
              </PartHeader>
              <PartSpec>{part.spec}</PartSpec>
              <PanelText>{part.description}</PanelText>
            </Panel>
          ))}
        </Parts>
      </Layout>
      <Rule>
        <strong>Regra de ouro:</strong> as lâminas saem sempre do mesmo rebite, na ordem azul, latão e oliva, da maior
        para a menor. Nunca gire, espelhe ou troque a ordem das lâminas.
      </Rule>
      <Label>Versões óticas</Label>
      <Lead>
        Em tamanhos pequenos, um desenho único ficaria fino demais. Abaixo de 48 px as lâminas engrossam; em 16 px o
        cabo vira um círculo.
      </Lead>
      <Grid $columns={3}>
        {brandOpticalSizes.map((optical) => (
          <Panel key={optical.variant}>
            <Stage $tone="dark">
              <BrandSymbol size={optical.size} variant={optical.variant} />
            </Stage>
            <PanelText>{optical.label}</PanelText>
          </Panel>
        ))}
      </Grid>
    </Section>
  );
};

export default SymbolSection;
