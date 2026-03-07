import { useEffect, useMemo, useState } from "react";
import {
  type AiModelSummary,
  type AiSource,
  useAiStore,
} from "@/store/ai-store";

export interface SourceModels {
  source: AiSource;
  models: AiModelSummary[];
}

export function useAvailableModels() {
  const sources = useAiStore((s) => s.sources);
  const getClientForSource = useAiStore((s) => s.getClientForSource);

  const enabledSources = useMemo(
    () => sources.filter((source) => source.enabled && source.apiKey),
    [sources]
  );

  const [sourceModelsMap, setSourceModelsMap] = useState<SourceModels[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchModels = async () => {
    setIsLoading(true);
    const results: SourceModels[] = [];

    for (const source of enabledSources) {
      try {
        const client = getClientForSource(source.id);
        if (client?.getAvailableModels) {
          const models = await client.getAvailableModels();
          results.push({ source, models });
        }
      } catch (error) {
        console.error(`Failed to fetch models for ${source.name}`, error);
      }
    }

    setSourceModelsMap(results);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    const doFetch = async () => {
      setIsLoading(true);
      const results: SourceModels[] = [];

      for (const source of enabledSources) {
        try {
          const client = getClientForSource(source.id);
          if (client?.getAvailableModels) {
            const models = await client.getAvailableModels();
            results.push({ source, models });
          }
        } catch (error) {
          console.error(`Failed to fetch models for ${source.name}`, error);
        }
      }

      if (!cancelled) {
        setSourceModelsMap(results);
        setIsLoading(false);
      }
    };

    void doFetch();

    return () => {
      cancelled = true;
    };
  }, [enabledSources, getClientForSource]);

  // Flatten all models for simple list access
  const allModels = useMemo(() => {
    const models: AiModelSummary[] = [];
    for (const { models: sourceModels } of sourceModelsMap) {
      models.push(...sourceModels);
    }
    return models;
  }, [sourceModelsMap]);

  return {
    sourceModelsMap,
    allModels,
    isLoading,
    refetch: fetchModels,
  };
}
