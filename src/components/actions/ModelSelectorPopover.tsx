import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  type AiModelSummary,
  type AiSource,
  useAiStore,
} from "@/store/ai-store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface SourceModels {
  source: AiSource;
  models: AiModelSummary[];
}

export default function ModelSelectorPopover() {
  const { t: tCommon } = useTranslation("commons");

  const sources = useAiStore((s) => s.sources);
  const activeSourceId = useAiStore((s) => s.activeSourceId);
  const updateSource = useAiStore((s) => s.updateSource);
  const setActiveSource = useAiStore((s) => s.setActiveSource);
  const getClientForSource = useAiStore((s) => s.getClientForSource);

  const activeSource = useMemo(
    () => sources.find((source) => source.id === activeSourceId) ?? sources[0],
    [sources, activeSourceId]
  );

  const enabledSources = useMemo(
    () => sources.filter((source) => source.enabled && source.apiKey),
    [sources]
  );

  const [sourceModelsMap, setSourceModelsMap] = useState<SourceModels[]>([]);
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchAllModels = async () => {
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
      }
    };

    void fetchAllModels();

    return () => {
      cancelled = true;
    };
  }, [enabledSources, getClientForSource]);

  const handleModelSelect = (sourceId: string, model: string) => {
    const targetSource = sources.find((s) => s.id === sourceId);
    if (!targetSource) return;

    // If selecting from a different source, switch to that source first
    if (sourceId !== activeSourceId) {
      setActiveSource(sourceId);
    }

    // Update the model for the target source
    updateSource(sourceId, { model });
    setModelPopoverOpen(false);
  };

  const modelDisplay = useMemo(() => {
    if (!activeSource) return "";
    if (!activeSource.model) return tCommon("settings-page.model.sel.none");

    // Find the model in all sources
    for (const { source, models } of sourceModelsMap) {
      if (source.id === activeSource.id) {
        const match = models.find((model) => model.name === activeSource.model);
        if (match) {
          return `${source.name}: ${match.displayName}`;
        }
      }
    }
    return `${activeSource.name}: ${activeSource.model}`;
  }, [activeSource, sourceModelsMap, tCommon]);

  return (
    <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={modelPopoverOpen}
          className="w-full justify-between"
        >
          {modelDisplay}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
        <Command>
          <CommandInput
            placeholder={tCommon("settings-page.model.sel.search")}
          />
          <CommandList>
            <CommandEmpty>
              {tCommon("settings-page.model.sel.empty")}
            </CommandEmpty>
            {sourceModelsMap.map(({ source, models }) => (
              <CommandGroup key={source.id} heading={source.name}>
                {models.map((model) => (
                  <CommandItem
                    key={`${source.id}-${model.name}`}
                    value={`${source.name} ${model.name} ${model.displayName}`}
                    onSelect={() => {
                      const isCurrentSelection =
                        activeSource?.id === source.id &&
                        activeSource?.model === model.name;
                      handleModelSelect(
                        source.id,
                        isCurrentSelection ? "" : model.name
                      );
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        activeSource?.id === source.id &&
                          activeSource?.model === model.name
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {model.displayName}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
