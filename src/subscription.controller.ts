import { Controller, Get, Post, Body } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @Get('create-catalog')
  createCatalog() {
    return this.subscriptionService.createCatalog();
  }

  @Get('list-catalog')
  listCatalog() {
    return this.subscriptionService.listCatalog();
  }

  @Get('create-subsuc')
  createSubsc() {
    return this.subscriptionService.createSubsc();
  }
  @Get('update-subsuc')
  updateSubsc() {
    return this.subscriptionService.updateSubsc();
  }
}
