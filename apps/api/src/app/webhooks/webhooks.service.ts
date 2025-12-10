import { Injectable, Logger } from '@nestjs/common';
import { appendFile } from 'fs/promises';
import { join } from 'path';
import { PostHogEvent, TrainingDataEntry } from './types';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly trainingDataPath = join(process.cwd(), 'training_data.jsonl');

  /**
   * Sanitize input_prompt: ensure it's a string and trim whitespace
   */
  private sanitizeInputPrompt(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    // Convert to string if not already, then trim whitespace
    return String(value).trim();
  }

  /**
   * Sanitize failure_reason: ensure it's a string and trim whitespace
   */
  private sanitizeFailureReason(value: unknown): string {
    if (value === null || value === undefined) {
      return 'unknown';
    }
    return String(value).trim() || 'unknown';
  }

  /**
   * Append training data to JSONL file (non-blocking)
   */
  private async appendToTrainingData(entry: TrainingDataEntry): Promise<void> {
    try {
      const jsonLine = JSON.stringify(entry) + '\n';
      await appendFile(this.trainingDataPath, jsonLine, 'utf-8');
      this.logger.log(`Training data appended to ${this.trainingDataPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to write training data: ${message}`);
    }
  }

  handleGenerationFailed(payload: PostHogEvent) {
    // Support both nested (properties.failure_reason) and flat (failure_reason) formats
    const { properties } = payload;
    const rawFailureReason = payload.failure_reason ?? properties?.failure_reason;
    const rawInputPrompt = payload.input_prompt ?? properties?.input_prompt;

    // Sanitize inputs
    const failureReason = this.sanitizeFailureReason(rawFailureReason);
    const inputPrompt = this.sanitizeInputPrompt(rawInputPrompt);
    const timestamp = payload.timestamp || new Date().toISOString();
    const userId = String(payload.distinct_id || 'anonymous').trim();

    // Log for data pipeline processing
    this.logger.log('====================================================');
    this.logger.warn('GENERATION FAILURE RECORDED');
    this.logger.log(`\tUser ID: ${userId}`);
    this.logger.log(`\tFailure Reason: ${failureReason}`);
    this.logger.log(`\tInput Prompt: ${inputPrompt}`);
    this.logger.log(`\tTimestamp: ${timestamp}`);
    this.logger.log('====================================================');

    // Append to training data file
    const trainingEntry: TrainingDataEntry = {
      timestamp,
      user_id: userId,
      failure_reason: failureReason,
      input_prompt: inputPrompt,
    };

    this.appendToTrainingData(trainingEntry);

    return {
      success: true,
      message: 'Generation failure logged',
      data: {
        failureReason,
        inputPrompt,
        userId,
      },
    };
  }
}

