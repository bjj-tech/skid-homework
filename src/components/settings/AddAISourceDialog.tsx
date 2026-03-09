import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AiProvider,
  DEFAULT_GEMINI_BASE_URL,
  DEFAULT_OPENAI_BASE_URL,
  useAiStore
} from "@/store/ai-store";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { OpenAIAdvancedOptions } from "./OpenAIAdvancedOptions";

export type AddAISourceDialogProps = {
  onChange: (dialogOpen: boolean) => void;
  open: boolean;
};

export default function AddAISourceDialog({
  onChange,
  open
}: AddAISourceDialogProps) {
  const { t } = useTranslation("commons", { keyPrefix: "settings-page" });

  const sources = useAiStore((s) => s.sources);
  const addSource = useAiStore((s) => s.addSource);
  const setActiveSource = useAiStore((s) => s.setActiveSource);

  const [newProvider, setNewProvider] = useState<AiProvider>("gemini");
  const [newSourceName, setNewSourceName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiAddress, setApiAddress] = useState("");
  const [useResponsesApi, setUseResponsesApi] = useState(true);
  const [webSearchToolType, setWebSearchToolType] = useState<
    string | undefined
  >(undefined);
  const [isCustomWebSearch, setIsCustomWebSearch] = useState(false);

  const resetAddDialog = () => {
    setNewSourceName("");
    setNewProvider("gemini");
    setApiAddress("");
    setUseResponsesApi(true);
    setWebSearchToolType(undefined);
    setIsCustomWebSearch(false);
  };

  const handleAddDialogChange = (open: boolean) => {
    onChange(open);
    if (!open) {
      resetAddDialog();
    }
  };

  const handleAddSource = () => {
    const provider = newProvider;
    const counter =
      sources.filter((source) => source.provider === provider).length + 1;
    const defaultName =
      provider === "gemini"
        ? t("sources.providers.gemini") + ` #${counter}`
        : t("sources.providers.openai") + ` #${counter}`;

    const name = newSourceName.trim() || defaultName;

    const newId = addSource({
      name,
      provider,
      apiKey: apiKey || null,
      baseUrl:
        apiAddress.trim() ||
        (provider === "gemini"
          ? DEFAULT_GEMINI_BASE_URL
          : DEFAULT_OPENAI_BASE_URL),
      traits: undefined,
      thinkingBudget: provider === "gemini" ? 8192 : undefined,
      useResponsesApi: provider === "openai" ? useResponsesApi : undefined,
      webSearchToolType: provider === "openai" ? webSearchToolType : undefined,
      enabled: true
    });

    setActiveSource(newId);
    onChange(false);
    resetAddDialog();
    toast.success(
      t("sources.add.success", {
        name
      })
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleAddDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("sources.add.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-provider">{t("sources.add.provider")}</Label>
            <select
              id="new-provider"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              value={newProvider}
              onChange={(event) =>
                setNewProvider(event.target.value as AiProvider)
              }
            >
              <option value="gemini">{t("sources.providers.gemini")}</option>
              <option value="openai">{t("sources.providers.openai")}</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-name">{t("sources.add.name")}</Label>
            <Input
              id="new-name"
              value={newSourceName}
              onChange={(event) => setNewSourceName(event.target.value)}
              placeholder={t("sources.add.name-placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-name">{t("sources.add.key")}</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={t("sources.add.key-placeholder")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-name">{t("sources.add.address")}</Label>
            <Input
              id="api-address"
              value={apiAddress}
              type="url"
              onChange={(event) => setApiAddress(event.target.value)}
              placeholder={
                newProvider === "gemini"
                  ? DEFAULT_GEMINI_BASE_URL
                  : DEFAULT_OPENAI_BASE_URL
              }
            />
          </div>

          {newProvider === "openai" && (
            <OpenAIAdvancedOptions
              apiAddress={apiAddress}
              setApiAddress={setApiAddress}
              useResponsesApi={useResponsesApi}
              setUseResponsesApi={setUseResponsesApi}
              webSearchToolType={webSearchToolType}
              setWebSearchToolType={setWebSearchToolType}
              isCustomWebSearch={isCustomWebSearch}
              setIsCustomWebSearch={setIsCustomWebSearch}
            />
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleAddDialogChange(false)}
          >
            {t("sources.add.cancel")}
          </Button>
          <Button onClick={handleAddSource}>{t("sources.add.confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
