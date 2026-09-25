export const AI_PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  OPENAI: "OpenAI",
  GEMINI: "Gemini",
  OPENROUTER: "OpenRouter",
  COHERE: "Cohere",
};

export function getAiProviderDisplayName(provider?: string | null): string {
  if (!provider) return "Unknown";
  const normalized = provider.trim().toUpperCase();
  if (AI_PROVIDER_DISPLAY_NAMES[normalized]) {
    return AI_PROVIDER_DISPLAY_NAMES[normalized];
  }
  // Safe generic fallback for unknown providers
  return provider.trim();
}
