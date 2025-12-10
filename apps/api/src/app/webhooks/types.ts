export interface PostHogEvent {
  event: string;
  distinct_id: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
  failure_reason?: string;
  input_prompt?: string;
}

export interface TrainingDataEntry {
  timestamp: string;
  user_id: string;
  failure_reason: string;
  input_prompt: string;
}
