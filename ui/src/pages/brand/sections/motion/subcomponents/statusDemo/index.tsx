import { SegmentedControl } from "@radix-ui/themes";
import { useState } from "react";

import BrandMark from "@components/brandMark";
import type { SymbolStatus } from "@utils/types/brand";

import { Demo } from "../../styles";

const statusOptions: { value: SymbolStatus; label: string }[] = [
  { value: "online", label: "API no ar" },
  { value: "offline", label: "API fora" }
];

const StatusDemo: React.FC = () => {
  const [status, setStatus] = useState<SymbolStatus>("online");

  const handleStatusChange = (raw: string) => {
    const option = statusOptions.find((item) => item.value === raw);
    if (option) setStatus(option.value);
  };

  return (
    <Demo>
      <BrandMark kind="symbol" size={90} status={status} pose={status === "online" ? "open" : "closed"} />
      <SegmentedControl.Root value={status} onValueChange={handleStatusChange} size="1">
        {statusOptions.map((option) => (
          <SegmentedControl.Item key={option.value} value={option.value}>
            {option.label}
          </SegmentedControl.Item>
        ))}
      </SegmentedControl.Root>
    </Demo>
  );
};

export default StatusDemo;
