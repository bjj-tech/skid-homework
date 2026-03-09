import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DEFAULT_OPENAI_BASE_URL } from "@/store/ai-store";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const PRESET_URLS: Record<string, string> = {
  openai: DEFAULT_OPENAI_BASE_URL,
  openrouter: "https://openrouter.ai/api/v1"
};

function detectPresetFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const normalizedUrl = url.replace(/\/$/, "");
  for (const [preset, presetUrl] of Object.entries(PRESET_URLS)) {
    if (normalizedUrl === presetUrl.replace(/\/$/, "")) {
      return preset;
    }
  }
  return undefined;
}

export type OpenAIAdvancedOptionsProps = {
  apiAddress: string;
  setApiAddress: (address: string) => void;
  useResponsesApi: boolean;
  setUseResponsesApi: (enabled: boolean) => void;
  webSearchToolType: string | undefined;
  setWebSearchToolType: (type: string | undefined) => void;
  isCustomWebSearch: boolean;
  setIsCustomWebSearch: (isCustom: boolean) => void;
};

export function OpenAIAdvancedOptions({
  apiAddress,
  setApiAddress,
  useResponsesApi,
  setUseResponsesApi,
  webSearchToolType,
  setWebSearchToolType,
  isCustomWebSearch,
  setIsCustomWebSearch
}: OpenAIAdvancedOptionsProps) {
  const { t } = useTranslation("commons", { keyPrefix: "settings-page" });

  const currentPreset = useMemo(
    () => detectPresetFromUrl(apiAddress || DEFAULT_OPENAI_BASE_URL),
    [apiAddress]
  );

  return (
    <Accordion type="single" collapsible className="w-full pt-2">
      <AccordionItem value="advanced-options" className="border-b-0">
        <AccordionTrigger className="text-sm font-medium border-t pt-4 pb-2 hover:no-underline">
          {t("api-credentials.advanced.title")}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>{t("api-credentials.advanced.quick-preset")}</Label>
            <Select
              value={currentPreset ?? "custom"}
              onValueChange={(val) => {
                if (val === "custom") {
                  return;
                }
                const presetUrl = PRESET_URLS[val];
                if (presetUrl) {
                  setApiAddress(presetUrl);
                  if (val === "openrouter") {
                    toast.success(
                      t("api-credentials.advanced.switched-openrouter")
                    );
                  } else if (val === "openai") {
                    toast.success(
                      t("api-credentials.advanced.switched-openai")
                    );
                  }
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "api-credentials.advanced.quick-preset-placeholder"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">
                  {t("api-credentials.advanced.openai-default")}
                </SelectItem>
                <SelectItem value="openrouter">
                  {t("api-credentials.advanced.openrouter")}
                </SelectItem>
                {currentPreset === undefined && (
                  <SelectItem value="custom">
                    {t("api-credentials.advanced.custom-url")}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="use-responses-api"
              checked={useResponsesApi}
              onCheckedChange={(checked) => {
                setUseResponsesApi(checked === true);
              }}
            />
            <Label htmlFor="use-responses-api" className="text-sm">
              {t("api-credentials.advanced.enable-responses-api")}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("api-credentials.advanced.responses-api-tip")}
          </p>

          <div className="space-y-2 pt-4">
            <Label>{t("api-credentials.advanced.web-search-tool.label")}</Label>
            <Select
              value={
                isCustomWebSearch ||
                (webSearchToolType !== undefined &&
                  !["web_search", "web_search_preview"].includes(
                    webSearchToolType
                  ))
                  ? "custom"
                  : webSearchToolType === undefined
                    ? "auto"
                    : webSearchToolType
              }
              onValueChange={(val) => {
                if (val === "auto") {
                  setIsCustomWebSearch(false);
                  setWebSearchToolType(undefined);
                } else if (val === "custom") {
                  setIsCustomWebSearch(true);
                  setWebSearchToolType(undefined);
                } else {
                  setIsCustomWebSearch(false);
                  setWebSearchToolType(val);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t(
                    "api-credentials.advanced.web-search-tool.placeholder"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  {t("api-credentials.advanced.web-search-tool.auto")}
                </SelectItem>
                <SelectItem value="web_search">
                  {t("api-credentials.advanced.web-search-tool.web-search")}
                </SelectItem>
                <SelectItem value="web_search_preview">
                  {t(
                    "api-credentials.advanced.web-search-tool.web-search-preview"
                  )}
                </SelectItem>
                <SelectItem value="custom">
                  {t("api-credentials.advanced.web-search-tool.custom")}
                </SelectItem>
              </SelectContent>
            </Select>
            {(isCustomWebSearch ||
              (webSearchToolType !== undefined &&
                !["web_search", "web_search_preview"].includes(
                  webSearchToolType
                ))) && (
              <Input
                placeholder={t(
                  "api-credentials.advanced.web-search-tool.custom-placeholder"
                )}
                value={webSearchToolType || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setWebSearchToolType(val || undefined);
                  if (val) {
                    setIsCustomWebSearch(false);
                  } else {
                    setIsCustomWebSearch(true);
                  }
                }}
              />
            )}
            <p className="text-xs text-muted-foreground">
              {t("api-credentials.advanced.web-search-tool.tip")}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
