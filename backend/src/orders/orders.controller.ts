import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import type { Order } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CreateOrderDto } from '../common/dto/create-order.dto';
import { UpdateOrderDto } from '../common/dto/update-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() orderData: CreateOrderDto): Promise<Order> {
    // Set default status to 'pending' if not provided
    const orderWithStatus = {
      ...orderData,
      status: orderData.status || 'pending'
    };
    return this.ordersService.createOrder(orderWithStatus);
  }

  @Get()
  @UseGuards(AdminGuard)
  async getAllOrders(@Query('userId') userId?: string): Promise<Order[]> {
    if (userId) {
      return await this.ordersService.findByUserId(userId);
    }
    return await this.ordersService.findAll();
  }

  @Get('check-txhash/:txHash')
  async checkTransactionHash(@Param('txHash') txHash: string): Promise<{ used: boolean; orderId?: string }> {
    return await this.ordersService.checkTransactionHash(txHash);
  }

  @Get('check-amount/:amount/:userId')
  async checkAmountUsage(@Param('amount') amount: string, @Param('userId') userId: string): Promise<{ used: boolean; orderId?: string }> {
    return await this.ordersService.checkAmountUsage(Number(amount), userId);
  }

  @Post('claim-txhash')
  async claimTransactionHash(@Body() body: { txHash: string; orderId: string }): Promise<{ success: boolean; alreadyUsed?: boolean; existingOrderId?: string }> {
    return await this.ordersService.claimTransactionHash(body.txHash, body.orderId);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<Order | undefined> {
    return await this.ordersService.findById(id);
  }

  @Put(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: Order['status']; txHash?: string }
  ): Promise<Order | undefined> {
    return this.ordersService.updateOrderStatus(id, body.status, body.txHash);
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() updates: UpdateOrderDto): Promise<Order | undefined> {
    return await this.ordersService.updateOrder(id, updates);
  }

  @Post('detect-payment')
  async detectPayment(@Body() body: { 
    txHash?: string; 
    userId: string;
    orderId?: string;
    expectedAmount?: number;
    depositAddress?: string;
  }): Promise<{ 
    success: boolean; 
    order?: Order; 
    message: string;
    paymentDetected?: boolean;
    txHash?: string;
  }> {
    // If txHash is provided, use the old method
    if (body.txHash) {
      return this.ordersService.detectAndCreateOrderForPayment(body.txHash, body.userId);
    }
    
    // Otherwise, use advanced detection
    return this.ordersService.detectPaymentAdvanced({
      userId: body.userId,
      orderId: body.orderId,
      expectedAmount: body.expectedAmount || 0,
      depositAddress: body.depositAddress || 'TVz5oQurcJUoPohtdCGH89PhqKvFgiYzRq'
    });
  }
}
