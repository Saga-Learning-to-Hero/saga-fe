export const AI_PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  OPENAI: "OpenAI",
  GEMINI: "Gemini",
  OPENROUTER: "OpenRouter",
  COHERE: "Cohere",
};

/** Providers the backend still supports but SAGA does not offer in its pickers. */
export const HIDDEN_AI_PROVIDERS: ReadonlySet<string> = new Set(["OPENROUTER"]);

export function isOfferedAiProvider(provider?: string | null): boolean {
  return !HIDDEN_AI_PROVIDERS.has((provider ?? "").trim().toUpperCase());
}

export function getAiProviderDisplayName(provider?: string | null): string {
  if (!provider) return "Unknown";
  const normalized = provider.trim().toUpperCase();
  if (AI_PROVIDER_DISPLAY_NAMES[normalized]) {
    return AI_PROVIDER_DISPLAY_NAMES[normalized];
  }
  // Safe generic fallback for unknown providers
  return provider.trim();
}
