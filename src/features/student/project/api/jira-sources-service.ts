import { apiClient } from "@/lib/axios";
import type {
  JiraSourceSummary,
  JiraFailoverPreviewRequest,
  JiraFailoverPreviewResponse,
  JiraFailoverExecuteRequest,
  JiraFailoverExecuteResponse,
  JiraFailoverRunResponse,
  JiraFailoverReconcileRequest,
  ProjectSyncEnqueueResponse,
} from "../types/jira-sources";
import type {
  ProjectJiraConnectResponse,
  UpdateProjectJiraPayload,
} from "../types/student-project";
import type { ProjectTaskOptionsResponse } from "@/features/student/sprint-progress/types/jira-task-types";

export class JiraSourcesService {
  static async listJiraSources(projectId: string): Promise<JiraSourceSummary[]> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanId = projectId.trim();
    const res = await apiClient.get<JiraSourceSummary[]>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources`
    );
    return res.data;
  }

  static async connectJiraSource(
    projectId: string,
    returnPath?: string
  ): Promise<ProjectJiraConnectResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    const cleanId = projectId.trim();
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const res = await apiClient.post<ProjectJiraConnectResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/connect`,
      null,
      { params }
    );
    return res.data;
  }

  static async reconnectJiraSource(
    projectId: string,
    integrationId: string,
    returnPath?: string
  ): Promise<ProjectJiraConnectResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!integrationId || !integrationId.trim()) {
      throw new Error("Throw ValidationException: Integration ID is required");
    }
    const cleanId = projectId.trim();
    const cleanIntegrationId = integrationId.trim();
    const params = returnPath ? { returnPath: returnPath.trim() } : undefined;
    const res = await apiClient.post<ProjectJiraConnectResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanIntegrationId)}/reconnect`,
      null,
      { params }
    );
    return res.data;
  }

  static async saveJiraSourceSelection(
    projectId: string,
    integrationId: string,
    selection: UpdateProjectJiraPayload
  ): Promise<void> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!integrationId || !integrationId.trim()) {
      throw new Error("Throw ValidationException: Integration ID is required");
    }
    const cleanId = projectId.trim();
    const cleanIntegrationId = integrationId.trim();
    await apiClient.put(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanIntegrationId)}`,
      selection
    );
  }

  static async disconnectJiraSource(
    projectId: string,
    integrationId: string
  ): Promise<void> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!integrationId || !integrationId.trim()) {
      throw new Error("Throw ValidationException: Integration ID is required");
    }
    const cleanId = projectId.trim();
    const cleanIntegrationId = integrationId.trim();
    await apiClient.delete(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanIntegrationId)}`
    );
  }

  static async syncJiraSource(
    projectId: string,
    integrationId: string
  ): Promise<ProjectSyncEnqueueResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!integrationId || !integrationId.trim()) {
      throw new Error("Throw ValidationException: Integration ID is required");
    }
    const cleanId = projectId.trim();
    const cleanIntegrationId = integrationId.trim();
    const res = await apiClient.post<ProjectSyncEnqueueResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanIntegrationId)}/sync`
    );
    return res.data;
  }

  static async getJiraSourceTaskOptions(
    projectId: string,
    integrationId: string
  ): Promise<ProjectTaskOptionsResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!integrationId || !integrationId.trim()) {
      throw new Error("Throw ValidationException: Integration ID is required");
    }
    const cleanId = projectId.trim();
    const cleanIntegrationId = integrationId.trim();
    const res = await apiClient.get<ProjectTaskOptionsResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanIntegrationId)}/task-options`
    );
    return res.data;
  }

  static async previewFailover(
    projectId: string,
    sourceIntegrationId: string,
    body: JiraFailoverPreviewRequest
  ): Promise<JiraFailoverPreviewResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sourceIntegrationId || !sourceIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Source Integration ID is required");
    }
    if (!body.targetIntegrationId || !body.targetIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Target Integration ID is required");
    }
    const cleanId = projectId.trim();
    const cleanSourceId = sourceIntegrationId.trim();
    const res = await apiClient.post<JiraFailoverPreviewResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanSourceId)}/failover/preview`,
      body
    );
    return res.data;
  }

  static async executeFailover(
    projectId: string,
    sourceIntegrationId: string,
    body: JiraFailoverExecuteRequest
  ): Promise<JiraFailoverExecuteResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sourceIntegrationId || !sourceIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Source Integration ID is required");
    }
    if (!body.targetIntegrationId || !body.targetIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Target Integration ID is required");
    }
    if (!body.sourceTaskIds || body.sourceTaskIds.length === 0) {
      throw new Error("Throw ValidationException: sourceTaskIds must not be empty");
    }
    const cleanId = projectId.trim();
    const cleanSourceId = sourceIntegrationId.trim();
    const res = await apiClient.post<JiraFailoverExecuteResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanSourceId)}/failover`,
      body
    );
    return res.data;
  }

  static async retryFailover(
    projectId: string,
    sourceIntegrationId: string,
    runId: string
  ): Promise<JiraFailoverExecuteResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sourceIntegrationId || !sourceIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Source Integration ID is required");
    }
    if (!runId || !runId.trim()) {
      throw new Error("Throw ValidationException: runId is required");
    }
    const cleanId = projectId.trim();
    const cleanSourceId = sourceIntegrationId.trim();
    const cleanRunId = runId.trim();
    const res = await apiClient.post<JiraFailoverExecuteResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanSourceId)}/failover/runs/${encodeURIComponent(cleanRunId)}/retry`
    );
    return res.data;
  }

  static async reconcileFailoverItem(
    projectId: string,
    sourceIntegrationId: string,
    runId: string,
    itemId: string,
    body: JiraFailoverReconcileRequest
  ): Promise<void> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sourceIntegrationId || !sourceIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Source Integration ID is required");
    }
    if (!runId || !runId.trim()) {
      throw new Error("Throw ValidationException: runId is required");
    }
    if (!itemId || !itemId.trim()) {
      throw new Error("Throw ValidationException: itemId is required");
    }
    if (!body.remoteIssueIdOrKey || !body.remoteIssueIdOrKey.trim()) {
      throw new Error("Throw ValidationException: remoteIssueIdOrKey is required");
    }
    const cleanId = projectId.trim();
    const cleanSourceId = sourceIntegrationId.trim();
    const cleanRunId = runId.trim();
    const cleanItemId = itemId.trim();
    await apiClient.post(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanSourceId)}/failover/runs/${encodeURIComponent(cleanRunId)}/items/${encodeURIComponent(cleanItemId)}/reconcile`,
      { remoteIssueIdOrKey: body.remoteIssueIdOrKey.trim() }
    );
  }

  static async getFailoverRun(
    projectId: string,
    sourceIntegrationId: string,
    runId: string,
    page = 0,
    size = 50
  ): Promise<JiraFailoverRunResponse> {
    if (!projectId || !projectId.trim()) {
      throw new Error("Throw ValidationException: Project ID is required");
    }
    if (!sourceIntegrationId || !sourceIntegrationId.trim()) {
      throw new Error("Throw ValidationException: Source Integration ID is required");
    }
    if (!runId || !runId.trim()) {
      throw new Error("Throw ValidationException: runId is required");
    }
    const cleanId = projectId.trim();
    const cleanSourceId = sourceIntegrationId.trim();
    const cleanRunId = runId.trim();
    const res = await apiClient.get<JiraFailoverRunResponse>(
      `/api/projects/${encodeURIComponent(cleanId)}/integrations/jira-sources/${encodeURIComponent(cleanSourceId)}/failover/runs/${encodeURIComponent(cleanRunId)}`,
      { params: { page, size } }
    );
    return res.data;
  }
}
