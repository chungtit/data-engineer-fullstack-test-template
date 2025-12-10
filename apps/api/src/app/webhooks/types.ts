export interface PostHogEvent {
  event: string;
  distinct_id: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

export interface TrainingDataEntry {
  timestamp: string;
  user_id: string;
}
