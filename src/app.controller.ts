import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/store-customer')
  storeCustomer(@Body() request) {
    return this.appService.storeCustomer(request);
  }

  @Get('/payments')
  payment() {
    return this.appService.payment();
  }
}
