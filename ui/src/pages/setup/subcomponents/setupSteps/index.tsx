import { CheckIcon } from "@radix-ui/react-icons";

import { Connector, Label, List, Marker, Step } from "./styles";
import VisuallyHidden from "@components/visuallyHidden";
import useSetupPage from "../../hook";

import type { SetupStep } from "./types";

const stateLabels = { done: "concluído", current: "passo atual", next: "próximo" } as const;

const SetupSteps = () => {
  const { step: currentStep } = useSetupPage();
  const isAdminStep = currentStep === "admin";
  const steps: SetupStep[] = [
    { label: "API conectada", state: "done" },
    { label: "Token de setup", state: isAdminStep ? "done" : "current" },
    { label: "Primeiro gestor", state: isAdminStep ? "current" : "next" },
    { label: "Primeira aplicação", state: "next" }
  ];

  return (
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
};

export default SetupSteps;
