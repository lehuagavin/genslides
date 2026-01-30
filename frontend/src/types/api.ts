/**
 * API-related type definitions
 */

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface GenerateTaskResponse {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
}

// WebSocket message types
export type WSMessageType =
  | "generation_started"
  | "generation_completed"
  | "generation_failed"
  | "style_generation_completed"
  | "cost_updated";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  data: T;
}

export interface GenerationStartedData {
  task_id: string;
  sid: string;
}

export interface GenerationCompletedData {
  task_id: string;
  sid: string;
  image: {
    hash: string;
    url: string;
    thumbnail_url: string;
  };
}

export interface GenerationFailedData {
  task_id: string;
  sid: string;
  error: string;
}

export interface StyleGenerationCompletedData {
  candidates: Array<{
    id: string;
    url: string;
  }>;
}

export interface CostUpdatedData {
  total_images: number;
  estimated_cost: number;
}
