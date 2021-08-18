import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
// https://github.com/square/square-nodejs-sdk
// $ npm install square
import {
  Client,
  Environment,
  CreateCustomerRequest,
  Address,
  ApiError,
  CreatePaymentRequest,
  Money,
  CreateCardRequest,
  Card,
} from 'square';

@Injectable()
export class AppService {
  getClient() {
    return new Client({
      environment: Environment.Sandbox,
      accessToken: process.env.SQUARE_ACCESS_TOKEN,
    });
  }

  async listCustomer() {
    const client = this.getClient();
    try {
      const { result, ...httpResponse } =
        await client.customersApi.listCustomers();
      // Get more response info...
      const { statusCode, headers } = httpResponse;
      console.log(...result.customers);
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = error.result;
        console.log(errors);
        // const { statusCode, headers } = error;
      }
    }
  }

  // To Store a Customer in Square
  async storeCustomer(request) {
    const client = this.getClient();
    // TODO authenticate the customer to get acutual customer's data.

    // TODO replace the code that is hard coded below
    const bodyAddress: Address = {};
    bodyAddress.addressLine1 = request.addressLine1;
    bodyAddress.addressLine2 = request.addressLine2;
    bodyAddress.addressLine3 = request.addressLine3;
    bodyAddress.country = 'JP';

    // TODO replace the code that is hard coded below
    const body: CreateCustomerRequest = {};
    body.idempotencyKey = uuidv4();
    body.givenName = request.givenName;
    body.familyName = request.familyName;
    body.companyName = request.companyName;
    body.emailAddress = request.emailAddress;
    body.address = bodyAddress;
    body.phoneNumber = request.phoneNumber;
    body.note = `${request.companyName} ${request.familyName}様`;

    try {
      // Call Create Customer API to create customer data to Square
      const { result, ...httpResponse } =
        await client.customersApi.createCustomer(body);
      // Get more response info...
      const { statusCode, headers } = httpResponse;
      console.log(result, statusCode, headers);
      // Store Customer's Card
      this.storeCard(request.sourceId, result.customer.id);
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = error.result;
        const { statusCode, headers } = error;
        console.log(statusCode, headers, errors);
        // TODO send error message to Slack or something
      }
    }
  }

  // To Store a Customer's Card in Square
  async storeCard(sourceId, customerId) {
    const client = this.getClient();
    const bodyCard: Card = {};
    bodyCard.customerId = customerId;
    const body: CreateCardRequest = {
      idempotencyKey: uuidv4(),
      sourceId,
      card: bodyCard,
    };

    try {
      const { result, ...httpResponse } = await client.cardsApi.createCard(
        body,
      );
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

  // execute payment
  async payment() {
    const client = this.getClient();
    // TODO get Customer ID from DB.
    const customerId = 'xxx';
    // TODO get Customer's Card ID by calling Retrive Card API
    const sourceId = 'ccof:xxx'; // TODO define the Card ID
    const bodyAmountMoney: Money = {};
    bodyAmountMoney.amount = BigInt(200.0); // TODO change the actual amount
    bodyAmountMoney.currency = 'JPY';

    const body: CreatePaymentRequest = {
      sourceId,
      // TODO read the document https://developer.squareup.com/docs/working-with-apis/idempotency
      idempotencyKey: uuidv4(),
      amountMoney: bodyAmountMoney,
    };

    body.customerId = customerId;
    // TODO change the note to text that admin can understand what payment detail is for.
    body.note = 'Brief description';

    try {
      const { result, ...httpResponse } =
        await client.paymentsApi.createPayment(body);
      // Get more response info...
      const { statusCode, headers } = httpResponse;
      console.log(result, statusCode, headers);
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = error.result;
        const { statusCode, headers } = error;
        console.log(errors, statusCode, headers);
        // TODO send error message to Slack or something
      }
    }
  }
}
