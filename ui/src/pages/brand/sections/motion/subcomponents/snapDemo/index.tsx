import { CheckIcon } from "@radix-ui/react-icons";
import { useState } from "react";

import { symbolMotion } from "@assets/config";
import BrandMark from "@components/brandMark";
import Button from "@components/button";

import { Demo } from "../../styles";

const SnapDemo: React.FC = () => {
  const [snapKey, setSnapKey] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setSnapKey((key) => key + 1);
    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), symbolMotion.savedFeedbackDuration);
  };

  return (
    <Demo>
      <BrandMark kind="symbol" size={90} snapKey={snapKey} />
      <Button variant="secondary" leftIcon={isSaved ? <CheckIcon /> : undefined} onClick={handleSave}>
        {isSaved ? "Salvo" : "Salvar"}
      </Button>
    </Demo>
  );
};

export default SnapDemo;
