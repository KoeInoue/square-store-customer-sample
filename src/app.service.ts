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
  CreateCustomerCardRequest,
  CreatePaymentRequest,
  Money,
  CustomersApi,
  PaymentsApi,
} from 'square';

@Injectable()
export class AppService {
  private readonly client: Client = new Client({
    environment: Environment.Sandbox,
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
  });

  // To call Customer API
  private readonly customersApi: CustomersApi = this.client.customersApi;
  // To call Payment API
  private readonly paymentsApi: PaymentsApi = this.client.paymentsApi;

  // To Store a Customer in Square
  async storeCustomer(request) {
    // TODO authenticate the customer to get acutual customer's data.

    // TODO replace the code that is hard coded below
    const bodyAddress: Address = {};
    bodyAddress.addressLine1 = '500 Electric Ave';
    bodyAddress.addressLine2 = 'Suite 600';
    bodyAddress.addressLine3 = 'address_line_38';
    bodyAddress.locality = 'New York';
    bodyAddress.sublocality = 'sublocality2';
    bodyAddress.administrativeDistrictLevel1 = 'NY';
    bodyAddress.postalCode = '10003';
    bodyAddress.country = 'US';

    // TODO replace the code that is hard coded below
    const body: CreateCustomerRequest = {};
    body.idempotencyKey = 'idempotency_key2';
    body.givenName = 'Amelia';
    body.familyName = 'Earhart';
    body.companyName = 'company_name2';
    body.nickname = 'nickname2';
    body.emailAddress = 'Amelia.Earhart@example.com';
    body.address = bodyAddress;
    body.phoneNumber = '1-212-555-4240';
    body.referenceId = 'YOUR_REFERENCE_ID';
    body.note = 'a customer';

    try {
      // Call Create Customer API to create customer data to Square
      const { result, ...httpResponse } =
        await this.customersApi.createCustomer(body);
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
    // sourceID is sent from Frontend
    const body: CreateCustomerCardRequest = {
      cardNonce: sourceId,
    };

    try {
      const { result, ...httpResponse } =
        await this.customersApi.createCustomerCard(customerId, body);
      // Get more response info...
      const { statusCode, headers } = httpResponse;
      console.log(result, statusCode, headers);
      return result.card.id;
    } catch (error) {
      if (error instanceof ApiError) {
        // const errors = error.result;
        const { statusCode, headers } = error;
        console.log(statusCode, headers);
        // TODO send error message to Slack or something
      }
    }
  }

  // execute payment
  async payment() {
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
      const { result, ...httpResponse } = await this.paymentsApi.createPayment(
        body,
      );
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
