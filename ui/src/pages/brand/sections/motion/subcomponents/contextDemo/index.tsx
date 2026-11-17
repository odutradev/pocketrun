import { SegmentedControl } from "@radix-ui/themes";
import { useState } from "react";

import { brandContextOptions } from "@assets/data";
import BrandMark from "@components/brandMark";
import type { BrandContext } from "@utils/types/brand";

import { ControlScroller } from "../../../../styles";
import { Demo } from "../../styles";

// A animação mora no BrandMark (`hasContextTransition`), a mesma usada no logo do menu do painel.
const ContextDemo = () => {
  const [context, setContext] = useState<BrandContext>("general");

  const handleContextChange = (raw: string) => {
    const option = brandContextOptions.find((item) => item.value === raw);
    if (option) setContext(option.value);
  };

  return (
    <Demo>
      <BrandMark size={22} context={context} hasContextTransition />
      <ControlScroller>
        <SegmentedControl.Root value={context} onValueChange={handleContextChange} size="1">
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
