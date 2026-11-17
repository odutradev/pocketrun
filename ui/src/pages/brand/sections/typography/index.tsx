import { SegmentedControl, TextField } from "@radix-ui/themes";

import { brandTypeFamilies, brandTypeScale } from "@assets/data";
import type { BrandOption } from "@utils/types/brand";

import useBrandPage from "../../hook";
import OptionSelect from "../../subcomponents/optionSelect";
import SectionHeading from "../../subcomponents/sectionHeading";
import { ControlScroller, Grid, Label, Panel, PanelText, PanelTitle, Section } from "../../styles";
import { Alphabet, Controls, Playground, Sample, ScaleLabel, ScaleRow, Specimen, Weight, Weights } from "./styles";

const alphabet = "Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789";

const Typography = () => {
  const {
    playgroundText,
    playgroundFamily,
    playgroundWeight,
    handlePlaygroundTextChange,
    handlePlaygroundFamilyChange,
    handlePlaygroundWeightChange
  } = useBrandPage();

  const activeFamily = brandTypeFamilies.find((item) => item.family === playgroundFamily) ?? brandTypeFamilies[0];
  const weightOptions: BrandOption<number>[] = activeFamily.weights.map((weight) => ({ value: weight, label: String(weight) }));

  const handleFamilyChange = (raw: string) => {
    const family = brandTypeFamilies.find((item) => item.family === raw);
    if (!family) return;
    handlePlaygroundFamilyChange(family.family);
    if (!family.weights.includes(playgroundWeight)) handlePlaygroundWeightChange(family.weights.at(-1) ?? 400);
  };

  return (
    <Section id="tipografia">
      <SectionHeading
        number="05"
        title="Tipografia"
        lead="Três famílias do Google Fonts: uma larga para a marca, uma neutra para a interface e uma monoespaçada para o código."
      />
      <Grid $columns={3}>
        {brandTypeFamilies.map((item) => (
          <Panel key={item.family}>
            <Specimen $family={item.family}>Aa</Specimen>
            <PanelTitle>{item.name}</PanelTitle>
            <PanelText>
              <strong>{item.role}.</strong> {item.description}
            </PanelText>
            <Weights>
              {item.weights.map((weight) => (
                <Weight key={weight} $family={item.family} $weight={weight}>
                  {weight}
                </Weight>
              ))}
            </Weights>
            <Alphabet $family={item.family}>{alphabet}</Alphabet>
          </Panel>
        ))}
      </Grid>
      <Label>Escala</Label>
      <Panel $padded={false}>
        {brandTypeScale.map((step) => (
          <ScaleRow key={step.label}>
            <ScaleLabel>{step.label}</ScaleLabel>
            <Sample
              $family={step.family}
              $size={step.size}
              $lineHeight={step.lineHeight}
              $weight={step.weight}
              $uppercase={Boolean(step.uppercase)}
            >
              {step.sample}
            </Sample>
          </ScaleRow>
        ))}
      </Panel>
      <Label>Teste a tipografia</Label>
      <Playground>
        <Controls>
          <TextField.Root
            size="3"
            value={playgroundText}
            onChange={(event) => handlePlaygroundTextChange(event.target.value)}
            placeholder="Digite sua frase"
            aria-label="Sua frase"
          />
          <ControlScroller>
            <SegmentedControl.Root value={playgroundFamily} onValueChange={handleFamilyChange}>
              {brandTypeFamilies.map((item) => (
                <SegmentedControl.Item key={item.family} value={item.family}>
                  {item.name}
                </SegmentedControl.Item>
              ))}
            </SegmentedControl.Root>
          </ControlScroller>
          <OptionSelect
            label="Peso"
            value={playgroundWeight}
            options={weightOptions}
            onChange={handlePlaygroundWeightChange}
          />
        </Controls>
        <Sample $family={playgroundFamily} $size={40} $lineHeight={1.15} $weight={playgroundWeight} $uppercase={false}>
          {playgroundText || "Digite sua frase"}
        </Sample>
      </Playground>
    </Section>
  );
};

export default Typography;
