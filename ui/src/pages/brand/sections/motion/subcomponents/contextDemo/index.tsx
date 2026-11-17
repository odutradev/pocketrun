import { SegmentedControl } from "@radix-ui/themes";
import { useState } from "react";

import { ControlScroller } from "../../../../styles";
import { brandContextOptions } from "@assets/data";
import BrandMark from "@components/brandMark";
import { Demo } from "../../styles";

import type { BrandContext } from "@utils/types/brand";

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
