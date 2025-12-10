import { Controller, Post, Body, Logger } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import type { PostHogEvent } from './types';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('generation-failed')
  handleGenerationFailedWebhook(@Body() payload: PostHogEvent) {
    this.logger.log('Received generation_failed webhook');
    this.logger.debug(JSON.stringify(payload, null, 2));
    return this.webhooksService.handleGenerationFailed(payload);
  }

}
