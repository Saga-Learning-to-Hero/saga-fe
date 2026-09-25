export type AiProviderType = "OPENAI" | "GEMINI" | "OPENROUTER" | "COHERE";

export interface AiProviderCatalogModel {
  provider: string;
  modelId: string;
  displayName: string;
  freeTierEligible: boolean;
  supportsStructuredOutput: boolean;
  recommendedForAutomation: boolean;
}

export interface AiProviderCatalogProvider {
  provider: string;
  displayName: string;
  models: AiProviderCatalogModel[];
}

export interface AiProviderCatalogResponse {
  providers: AiProviderCatalogProvider[];
  freeTierNotice: string;
}

export interface AiProviderBinding {
  provider: string;
  modelId: string;
}

export interface CourseAiSettingsResponse {
  automationEnabled: boolean;
  allowPlatformFallback: boolean;
  primaryBinding: AiProviderBinding | null;
  fallbackEnabled: boolean;
  fallbackBindings: AiProviderBinding[];
  secondaryBinding: AiProviderBinding | null;
}

export interface CourseAiSettingsUpdateRequest {
  automationEnabled: boolean;
  allowPlatformFallback: boolean;
}

export interface CourseAiBindingsUpdateRequest {
  primaryBinding?: AiProviderBinding | null;
  fallbackEnabled?: boolean;
  fallbackBindings?: AiProviderBinding[];
  secondaryBinding?: AiProviderBinding | null;
}

export type AiCredentialStatus =
  | "UNVERIFIED"
  | "ACTIVE"
  | "DEGRADED"
  | "INVALID"
  | "REVOKED";

export interface CourseAiCredentialResponse {
  configured: boolean;
  provider: string | null;
  role: string;
  status: AiCredentialStatus | string | null;
  lastFour: string | null;
  createdAt?: string | null;
  updatedAt: string | null;
  lastSuccessfulUseAt: string | null;
}

export interface CourseAiCredentialPutRequest {
  provider?: string;
  apiKey: string;
}
