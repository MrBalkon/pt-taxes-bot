import { Injectable, Logger } from '@nestjs/common';
import {
  Task,
  TaskProcessingPayload,
} from '../../../task-processing-queue/task-processing.types';

import { SubscriptionService } from 'src/modules/subscription/subscription.service';

@Injectable()
export class CheckExpiredSubscriptionsTask implements Task {
  private readonly logger = new Logger(CheckExpiredSubscriptionsTask.name);
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async run(task: TaskProcessingPayload): Promise<void> {
    const unactiveSubscriptions =
      await this.subscriptionService.getUnactiveSubscriptionsWithFeatures();

    this.logger.log(
      `Found ${unactiveSubscriptions.length} unactive subscriptions`,
    );

    for (const subscription of unactiveSubscriptions) {
      this.logger.log(
        `Deleting subscription features for subscription = "${subscription.id}"`,
      );
      await this.subscriptionService.deleteSubscriptionAcesses(subscription);
    }
  }
}
