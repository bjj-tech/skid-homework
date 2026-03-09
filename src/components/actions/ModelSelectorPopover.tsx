"use client";

import { useState } from "react";
import { useAiStore } from "@/store/ai-store";
import { useAvailableModels } from "@/hooks/use-available-models";
import {
  CUSTOM_MODEL_VALUE,
  ModelSelector
} from "@/components/ui/model-selector";

export default function ModelSelectorPopover() {
  const currentModel = useAiStore((s) => s.currentModel);
  const setCurrentModel = useAiStore((s) => s.setCurrentModel);
  const isCustomModel = useAiStore((s) => s.isCustomModel);
  const setIsCustomModel = useAiStore((s) => s.setIsCustomModel);

  const { sourceModelsMap } = useAvailableModels();
  const [open, setOpen] = useState(false);

  const handleModelSelect = (model: string) => {
    if (model === CUSTOM_MODEL_VALUE) {
      setIsCustomModel(true);
    } else {
      setIsCustomModel(false);
      setCurrentModel(model);
    }
  };

  return (
    <ModelSelector
      sourceModelsMap={sourceModelsMap}
      value={currentModel}
      onChangeAction={handleModelSelect}
      open={open}
      onOpenChangeAction={setOpen}
      allowCustom={true}
      isCustomSelected={isCustomModel}
      className="w-full"
    />
  );
}
