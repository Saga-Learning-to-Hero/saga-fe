export interface CourseAiSettingsResponse {
  automationEnabled: boolean;
  allowPlatformFallback: boolean;
}

export interface CourseAiSettingsUpdateRequest {
  automationEnabled: boolean;
  allowPlatformFallback: boolean;
}

export interface CourseAiCredentialResponse {
  configured: boolean;
  provider: string | null;
  role: string;
  status: string | null;
  lastFour: string | null;
  updatedAt: string | null;
  lastSuccessfulUseAt: string | null;
}

export interface CourseAiCredentialPutRequest {
  provider: string;
  apiKey: string;
}
