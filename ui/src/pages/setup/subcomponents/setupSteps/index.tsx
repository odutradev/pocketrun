import { CheckIcon } from "@radix-ui/react-icons";

import { Connector, Label, List, Marker, Step } from "./styles";
import VisuallyHidden from "@components/visuallyHidden";

import type { SetupStep } from "./types";



const steps: SetupStep[] = [
  { label: "API conectada", state: "done" },
  { label: "Primeiro gestor", state: "current" },
  { label: "Primeira aplicação", state: "next" }
];

const stateLabels = { done: "concluído", current: "passo atual", next: "próximo" } as const;

const SetupSteps = () => (
  <List aria-label="Passos do setup">
    {steps.map((step, index) => (
      <Step key={step.label} aria-current={step.state === "current" ? "step" : undefined}>
        {index > 0 && <Connector aria-hidden="true" $isDone={step.state !== "next"} />}
        <Marker aria-hidden="true" $state={step.state}>
          {step.state === "done" ? <CheckIcon /> : index + 1}
        </Marker>
        <Label $state={step.state}>
          {step.label}
          <VisuallyHidden> ({stateLabels[step.state]})</VisuallyHidden>
        </Label>
      </Step>
    ))}
  </List>
);

export default SetupSteps;
