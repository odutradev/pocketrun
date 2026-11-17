import { SegmentedControl } from "@radix-ui/themes";
import { useState } from "react";
import { useTheme } from "styled-components";

import { brandContextOptions } from "@assets/data";
import BrandMark from "@components/brandMark";
import type { BrandContext, SymbolPose } from "@utils/types/brand";

import { ControlScroller } from "../../../../styles";
import { Demo } from "../../styles";

const ContextDemo: React.FC = () => {
  const { motion } = useTheme();
  const [selected, setSelected] = useState<BrandContext>("general");
  const [context, setContext] = useState<BrandContext>("general");
  const [pose, setPose] = useState<SymbolPose>("open");

  const handleContextChange = (raw: string) => {
    const option = brandContextOptions.find((item) => item.value === raw);
    if (!option) return;
    setSelected(option.value);
    setPose("closed");
    // Troca a cor com as lâminas escondidas atrás do cabo e só então reabre.
    window.setTimeout(() => {
      setContext(option.value);
      setPose("open");
    }, motion.base + motion.stagger);
  };

  return (
    <Demo>
      <BrandMark size={22} context={context} pose={pose} />
      <ControlScroller>
        <SegmentedControl.Root value={selected} onValueChange={handleContextChange} size="1">
          {brandContextOptions.map((option) => (
            <SegmentedControl.Item key={option.value} value={option.value}>
              {option.label}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </ControlScroller>
    </Demo>
  );
};

export default ContextDemo;
