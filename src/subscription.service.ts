import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
// https://github.com/square/square-nodejs-sdk
// $ npm install square
import {
  Client,
  Environment,
  ApiError,
  Money,
  CatalogApi,
  SubscriptionsApi,
  Subscription,
  UpdateSubscriptionRequest,
} from 'square';

@Injectable()
export class SubscriptionService {
  private readonly client: Client = new Client({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
  });
  // To call Catalog API
  private readonly catalogApi: CatalogApi = this.client.catalogApi;
  private readonly subscriptionsApi: SubscriptionsApi =
    this.client.subscriptionsApi;

  async createCatalog() {
    try {
      const response = await this.catalogApi.upsertCatalogObject({
        idempotencyKey: uuidv4(),
        object: {
          type: 'SUBSCRIPTION_PLAN',
          id: '#plan',
          subscriptionPlanData: {
            name: '',
            phases: [
              {
                cadence: 'MONTHLY',
                recurringPriceMoney: {
                  amount: BigInt(5000),
                  currency: 'JPY',
                },
              },
            ],
          },
        },
      });

      console.log(response.result);
    } catch (error) {
      console.log(error);
    }
  }

  async listCatalog() {
    try {
      const response = await this.catalogApi.listCatalog(
        '',
        'SUBSCRIPTION_PLAN',
      );

      console.log(response.result);
    } catch (error) {
      console.log(error);
    }
  }

  async createSubsc() {
    try {
      const response = await this.subscriptionsApi.createSubscription({
        idempotencyKey: uuidv4(),
        locationId: '',
        planId: '', // TODO you need to create Catalog in advance.
        customerId: '',
        taxPercentage: '',
        cardId: 'ccof:',
        timezone: 'Japan',
      });

      console.log(response.result);
    } catch (error) {
      console.log(error);
    }
  }

  async updateSubsc() {
    const subscriptionId = '';
    const bodySubscriptionPriceOverrideMoney: Money = {};
    bodySubscriptionPriceOverrideMoney.amount = BigInt(7500);
    bodySubscriptionPriceOverrideMoney.currency = 'JPY';

    const bodySubscription: Subscription = {};
    bodySubscription.locationId = '';
    bodySubscription.planId = '';
    bodySubscription.customerId = '';
    bodySubscription.priceOverrideMoney = bodySubscriptionPriceOverrideMoney;
    bodySubscription.version = BigInt(1);

    const body: UpdateSubscriptionRequest = {};
    body.subscription = bodySubscription;

    try {
      const { result, ...httpResponse } =
        await this.subscriptionsApi.updateSubscription(subscriptionId, body);
      console.log(result);

      // Get more response info...
      // const { statusCode, headers } = httpResponse;
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = error.result;
        console.log(errors);

        // const { statusCode, headers } = error;
      }
    }
  }
}
